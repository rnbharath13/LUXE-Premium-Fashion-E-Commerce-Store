import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { supabase } from '../config/supabase.js';
import { generateRefreshToken, hashToken } from '../lib/crypto.js';

const SALT_ROUNDS      = 12;
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MINUTES  = 15;

export const REFRESH_COOKIE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   30 * 24 * 60 * 60 * 1000,
  path:     '/api/auth',
};

export const signAccess = (userId, email) =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '15m' });

// ── User queries ─────────────────────────────────────────────

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, password_hash, first_name, last_name, role, failed_login_attempts, locked_until, email_verified')
    .eq('email', email.toLowerCase().trim())
    .single();
  return { user: data, error };
};

export const findUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, role, email_verified, created_at')
    .eq('id', userId)
    .single();
  return { user: data, error };
};

// ── Registration ─────────────────────────────────────────────

export const createUser = async ({ email, password, firstName, lastName }) => {
  const passwordHash    = await bcrypt.hash(password, SALT_ROUNDS);
  const verifyToken     = crypto.randomBytes(32).toString('hex');
  const verifyTokenHash = hashToken(verifyToken);

  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      email:                email.toLowerCase().trim(),
      password_hash:        passwordHash,
      first_name:           firstName ?? '',
      last_name:            lastName  ?? '',
      role:                 'customer',
      email_verified:       false,
      email_verify_token:   verifyTokenHash,
      email_verify_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }])
    .select('id, email, first_name, last_name, role, email_verified')
    .single();

  return { user, error, verifyToken };
};

// ── Login ────────────────────────────────────────────────────

// Dummy hash ensures bcrypt always runs — prevents timing attacks on non-existent users
const DUMMY_HASH = '$2b$12$invalidhashfortimingsafetyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export const verifyCredentials = async (email, password) => {
  const { user } = await findUserByEmail(email);

  const hashToCompare = user?.password_hash || DUMMY_HASH;
  const match         = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    if (user) await incrementFailedAttempts(user.id, user.failed_login_attempts);
    return { user: null, reason: 'invalid_credentials' };
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return { user: null, reason: 'account_locked', lockedUntil: user.locked_until };
  }

  await supabase
    .from('users')
    .update({ failed_login_attempts: 0, locked_until: null })
    .eq('id', user.id);

  const { password_hash, failed_login_attempts, locked_until, ...safeUser } = user;
  return { user: safeUser };
};

const incrementFailedAttempts = async (userId, currentAttempts) => {
  const newAttempts = (currentAttempts || 0) + 1;
  const lockUntil   = newAttempts >= LOCKOUT_ATTEMPTS
    ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
    : null;
  await supabase
    .from('users')
    .update({ failed_login_attempts: newAttempts, ...(lockUntil && { locked_until: lockUntil }) })
    .eq('id', userId);
};

// ── Refresh token store ───────────────────────────────────────

export const createRefreshToken = async (userId) => {
  const raw     = generateRefreshToken();
  const hash    = hashToken(raw);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('refresh_tokens')
    .insert([{ user_id: userId, token_hash: hash, expires_at: expires.toISOString() }]);

  if (error) throw error;
  return raw;
};

export const rotateRefreshToken = async (rawToken) => {
  const hash = hashToken(rawToken);

  const { data: stored, error } = await supabase
    .from('refresh_tokens')
    .select('id, user_id, expires_at, revoked')
    .eq('token_hash', hash)
    .single();

  if (error || !stored) return { userId: null, reason: 'not_found' };

  if (stored.revoked) {
    // Token already used — possible theft, revoke entire session family
    await revokeAllUserTokens(stored.user_id);
    return { userId: null, reason: 'reuse_detected' };
  }

  if (new Date(stored.expires_at) < new Date()) {
    return { userId: null, reason: 'expired' };
  }

  await supabase.from('refresh_tokens').update({ revoked: true }).eq('id', stored.id);
  const newRaw = await createRefreshToken(stored.user_id);
  return { userId: stored.user_id, newRawToken: newRaw };
};

export const revokeRefreshToken = async (rawToken) => {
  const hash = hashToken(rawToken);
  await supabase.from('refresh_tokens').update({ revoked: true }).eq('token_hash', hash);
};

export const revokeAllUserTokens = async (userId) => {
  await supabase
    .from('refresh_tokens')
    .update({ revoked: true })
    .eq('user_id', userId)
    .eq('revoked', false);
};

// ── Email verification ────────────────────────────────────────

export const verifyEmail = async (token) => {
  const tokenHash = hashToken(token);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, email_verify_expires, email_verified')
    .eq('email_verify_token', tokenHash)
    .single();

  if (error || !user)                                   return { success: false, reason: 'invalid_token' };
  if (user.email_verified)                              return { success: false, reason: 'already_verified' };
  if (new Date(user.email_verify_expires) < new Date()) return { success: false, reason: 'expired' };

  await supabase
    .from('users')
    .update({ email_verified: true, email_verify_token: null, email_verify_expires: null })
    .eq('id', user.id);

  return { success: true, userId: user.id };
};

// ── Password reset ────────────────────────────────────────────

export const generateResetToken = (userId, passwordHash) =>
  jwt.sign({ userId }, process.env.JWT_SECRET + passwordHash, { algorithm: 'HS256', expiresIn: '15m' });

export const verifyResetToken = (token, passwordHash) => {
  try { return jwt.verify(token, process.env.JWT_SECRET + passwordHash); }
  catch { return null; }
};

export const resetUserPassword = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUserById(userId, { password_hash: passwordHash });
};

// ── Profile ───────────────────────────────────────────────────

export const updateUserById = async (userId, fields) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, email, first_name, last_name, phone, role')
    .single();
  return { data, error };
};

// ── Email ─────────────────────────────────────────────────────

const getTransporter = () => nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export const sendVerificationEmail = async (email, verifyUrl) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[DEV] Verify email → ${verifyUrl}\n`);
    return;
  }
  await getTransporter().sendMail({
    from:    `"LUXE" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Verify your LUXE email',
    html:    `<p>Welcome to LUXE! <a href="${verifyUrl}">Verify your email</a> (expires in 24 hours).</p>`,
  });
};

export const sendResetEmail = async (email, resetUrl) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[DEV] Reset password → ${resetUrl}\n`);
    return;
  }
  await getTransporter().sendMail({
    from:    `"LUXE" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Reset your LUXE password',
    html:    `<p><a href="${resetUrl}">Reset your password</a> (expires in 15 minutes).</p>`,
  });
};

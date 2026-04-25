import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// ── Token helpers ────────────────────────────────────────────

const signAccess = (userId, email) =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '15m' });

const signRefresh = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

const REFRESH_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/api/auth',
};

// ── Register ─────────────────────────────────────────────────

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        first_name: firstName ?? '',
        last_name:  lastName  ?? '',
      }])
      .select('id, email, first_name, last_name')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw error;
    }

    res.cookie('refreshToken', signRefresh(user.id), REFRESH_COOKIE);
    res.status(201).json({ user, token: signAccess(user.id, user.email) });
  } catch (err) {
    next(err);
  }
};

// ── Login ────────────────────────────────────────────────────

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name')
      .eq('email', email)
      .single();

    // Same error message for "not found" and "wrong password" — prevents user enumeration
    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const { password_hash, ...userData } = user;

    res.cookie('refreshToken', signRefresh(user.id), REFRESH_COOKIE);
    res.json({ user: userData, token: signAccess(user.id, user.email) });
  } catch (err) {
    next(err);
  }
};

// ── Refresh access token ─────────────────────────────────────

export const refreshToken = (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const { userId } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    res.json({ token: signAccess(userId) });
  } catch {
    res.clearCookie('refreshToken', REFRESH_COOKIE);
    res.status(401).json({ error: 'Refresh token expired, please login again' });
  }
};

// ── Logout ───────────────────────────────────────────────────

export const logout = (req, res) => {
  res.clearCookie('refreshToken', REFRESH_COOKIE);
  res.json({ message: 'Logged out successfully' });
};

// ── Get profile ──────────────────────────────────────────────

export const getProfile = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ── Update profile ───────────────────────────────────────────

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name:  lastName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.userId)
      .select('id, email, first_name, last_name, phone')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

import {
  createUser, verifyCredentials, findUserByEmail, findUserById, updateUserById,
  generateResetToken, verifyResetToken, resetUserPassword,
  sendVerificationEmail, sendResetEmail, verifyEmail,
  createRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens,
  listSessions, revokeSessionById,
  signAccess, REFRESH_COOKIE,
} from '../services/authService.js';
import { authLog } from '../lib/logger.js';

const ip = (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown';

// Capture device fingerprint for the session record. Truncated to keep DB rows bounded.
const captureMeta = (req) => ({
  userAgent: req.headers['user-agent']?.slice(0, 500) ?? null,
  ip:        ip(req),
});

export const register = async (req, res, next) => {
  try {
    const { user, error, verifyToken } = await createUser(req.body);

    if (error) {
      if (error.code === '23505') {
        authLog.registerDuplicate(req.body.email, ip(req));
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw error;
    }

    const rawRefresh = await createRefreshToken(user.id, captureMeta(req));
    await sendVerificationEmail(user.email, `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`);
    authLog.registerSuccess(user.id, user.email, ip(req));

    res.cookie('refreshToken', rawRefresh, REFRESH_COOKIE);
    res.status(201).json({ user, token: signAccess(user.id, user.email, user.role) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, reason, lockedUntil } = await verifyCredentials(email, password);

    if (!user) {
      if (reason === 'account_locked') {
        authLog.loginLocked(email, ip(req));
        return res.status(423).json({
          error: `Account locked. Try again after ${new Date(lockedUntil).toLocaleTimeString()}.`,
        });
      }
      authLog.loginFailed(email, ip(req), reason);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const rawRefresh = await createRefreshToken(user.id, captureMeta(req));
    authLog.loginSuccess(user.id, user.email, ip(req));

    res.cookie('refreshToken', rawRefresh, REFRESH_COOKIE);
    res.json({ user, token: signAccess(user.id, user.email, user.role) });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ error: 'No refresh token' });

    const { userId, newRawToken, reason } = await rotateRefreshToken(raw, captureMeta(req));

    if (!userId) {
      authLog.tokenInvalid(ip(req), reason);
      res.clearCookie('refreshToken', REFRESH_COOKIE);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const { user, error } = await findUserById(userId);
    if (error || !user) {
      res.clearCookie('refreshToken', REFRESH_COOKIE);
      return res.status(401).json({ error: 'User no longer exists' });
    }

    authLog.tokenRefreshed(userId, ip(req));
    res.cookie('refreshToken', newRawToken, REFRESH_COOKIE);
    res.json({ user, token: signAccess(user.id, user.email, user.role) });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) await revokeRefreshToken(raw);
    authLog.logoutSuccess(req.user?.userId || 'unknown', ip(req));
    res.clearCookie('refreshToken', REFRESH_COOKIE);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await revokeAllUserTokens(req.user.userId);
    res.clearCookie('refreshToken', REFRESH_COOKIE);
    res.json({ message: 'Logged out from all devices' });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { user, error } = await findUserById(req.user.userId);
    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const { data, error } = await updateUserById(req.user.userId, {
      first_name: firstName,
      last_name:  lastName,
      phone,
    });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const verifyEmailHandler = async (req, res, next) => {
  try {
    const result = await verifyEmail(req.body.token);
    if (!result.success) {
      const messages = {
        invalid_token:    'Invalid verification link.',
        already_verified: 'Email is already verified.',
        expired:          'Verification link expired. Please request a new one.',
      };
      return res.status(400).json({ error: messages[result.reason] || 'Verification failed' });
    }
    authLog.emailVerified(result.userId, ip(req));
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { user } = await findUserByEmail(req.body.email);
    if (user) {
      const resetToken = generateResetToken(user.id, user.password_hash);
      await sendResetEmail(user.email, `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user.id}`);
      authLog.passwordResetRequest(user.email, ip(req));
    }
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, userId, password } = req.body;

    const { user, error } = await findUserById(userId);
    if (error || !user) return res.status(400).json({ error: 'Invalid reset link' });

    const { user: fullUser } = await findUserByEmail(user.email);
    if (!verifyResetToken(token, fullUser.password_hash)) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    }

    await resetUserPassword(userId, password);
    await revokeAllUserTokens(userId);
    res.clearCookie('refreshToken', REFRESH_COOKIE);

    authLog.passwordResetSuccess(userId, ip(req));
    res.json({ message: 'Password reset successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

// ── Sessions / device dashboard ──────────────────────────────

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await listSessions(req.user.userId, req.cookies?.refreshToken);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

export const revokeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { success } = await revokeSessionById(req.user.userId, id);
    if (!success) return res.status(404).json({ error: 'Session not found' });
    authLog.tokenInvalid(ip(req), `manual_revoke:${id}`);
    res.json({ message: 'Session revoked' });
  } catch (err) {
    next(err);
  }
};

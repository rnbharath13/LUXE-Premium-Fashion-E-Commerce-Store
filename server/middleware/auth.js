import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authorised, no token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Not authorised, invalid token' });
  }
};

// Authorize by role. Use AFTER `protect` so req.user is populated.
// Usage: router.get('/admin/...', protect, requireRole('admin'), handler)
// Server-side enforcement only — never trust frontend role checks.
export const requireRole = (...allowed) => (req, res, next) => {
  if (!req.user?.role || !allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

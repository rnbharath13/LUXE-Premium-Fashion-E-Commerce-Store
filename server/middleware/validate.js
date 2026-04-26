export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation failed', errors });
  }
  req.body = result.data;
  next();
};

// Same shape, but validates req.query. Coerced/defaulted values are written back
// in-place because Express 5 makes req.query a non-writable getter — we mutate keys.
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ error: 'Invalid query parameters', errors });
  }
  for (const k of Object.keys(req.query)) delete req.query[k];
  Object.assign(req.query, result.data);
  next();
};

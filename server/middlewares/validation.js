import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateEmail = () => body('email').isEmail().normalizeEmail();
export const validatePassword = () => body('password').isLength({ min: 6 });
export const validateRequired = (field) => body(field).notEmpty().withMessage(`${field} is required`);

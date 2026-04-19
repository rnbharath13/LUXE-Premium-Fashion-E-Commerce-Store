import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { validateEmail, validatePassword, validateRequired, validateRequest } from '../middlewares/validation.js';

const router = express.Router();

router.post('/register',
  validateRequired('name'),
  validateEmail(),
  validatePassword(),
  validateRequest,
  register
);

router.post('/login',
  validateEmail(),
  validatePassword(),
  validateRequest,
  login
);

router.post('/logout', logout);

export default router;

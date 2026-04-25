import { Router } from 'express';
import { register, login, refreshToken, logout, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/refresh',  refreshToken);
router.post('/logout',   logout);

router.get('/profile',   protect, getProfile);
router.put('/profile',   protect, validate(updateProfileSchema), updateProfile);

export default router;

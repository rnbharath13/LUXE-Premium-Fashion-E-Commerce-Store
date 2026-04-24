import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/register', validateBody(['email', 'password']), register);
router.post('/login',    validateBody(['email', 'password']), login);
router.get('/profile',   protect, getProfile);
router.put('/profile',   protect, updateProfile);

export default router;

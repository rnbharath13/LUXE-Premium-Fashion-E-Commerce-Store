import express from 'express';
import { getDashboard, getUsers, getOrders, getSalesAnalytics } from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken, authorizeRole(['admin']));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/orders', getOrders);
router.get('/analytics', getSalesAnalytics);

export default router;

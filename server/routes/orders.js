import express from 'express';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', authenticateToken, createOrder);
router.get('/user', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id', authenticateToken, authorizeRole(['admin']), updateOrderStatus);

export default router;

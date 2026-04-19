import express from 'express';
import { addToCart, getCart, updateCartItem, deleteCartItem, clearCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/add', authenticateToken, addToCart);
router.get('/', authenticateToken, getCart);
router.put('/:id', authenticateToken, updateCartItem);
router.delete('/:id', authenticateToken, deleteCartItem);
router.delete('/', authenticateToken, clearCart);

export default router;

import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post('/',          validateBody(['items', 'shippingAddress', 'paymentMethod']), createOrder);
router.get('/',           getUserOrders);
router.get('/:id',        getOrderById);
router.patch('/:id/cancel', cancelOrder);

export default router;

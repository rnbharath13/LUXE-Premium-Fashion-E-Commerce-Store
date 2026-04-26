import { Router } from 'express';
import { z } from 'zod';
import { createOrder, getUserOrders, getOrderById, cancelOrder, requestReturn } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { MAX_ITEMS_PER_ORDER, MAX_QUANTITY_PER_LINE } from '../config/checkout.js';

const router = Router();

router.use(protect);

const addressSchema = z.object({
  fullName:   z.string().trim().min(2).max(100),
  phone:      z.string().trim().min(7).max(20),
  line1:      z.string().trim().min(3).max(200),
  line2:      z.string().trim().max(200).optional().default(''),
  city:       z.string().trim().min(2).max(100),
  state:      z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(20),
  country:    z.string().trim().min(2).max(100),
  location:   z.object({
    latitude:         z.number().gte(-90).lte(90),
    longitude:        z.number().gte(-180).lte(180),
    formattedAddress: z.string().trim().min(3).max(300),
    placeId:          z.string().trim().max(200).optional().default(''),
    source:           z.enum(['google_geocode']).default('google_geocode'),
  }).optional(),
});

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity:  z.number().int().positive().max(MAX_QUANTITY_PER_LINE),
  size:      z.string().max(50).optional().default(''),
  color:     z.string().max(50).optional().default(''),
});

const createOrderSchema = z.object({
  items:           z.array(orderItemSchema).min(1).max(MAX_ITEMS_PER_ORDER),
  shippingAddress: addressSchema,
  billingAddress:  addressSchema,
  paymentMethod:   z.enum(['card', 'cod']),
});

const requestReturnSchema = z.object({
  reason: z.string().trim().min(5, 'Tell us why you\'re returning (5+ chars)').max(1000),
});

router.post('/',            validate(createOrderSchema), createOrder);
router.get('/',             getUserOrders);
router.get('/:id',          getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.post('/:id/return',  validate(requestReturnSchema), requestReturn);

export default router;

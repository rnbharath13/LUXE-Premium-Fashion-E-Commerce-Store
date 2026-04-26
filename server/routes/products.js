import { Router } from 'express';
import {
  getProducts, getProductById, getRelatedProducts,
  getProductReviews, createProductReview,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const reviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

router.get('/',                getProducts);
router.get('/:id',             getProductById);
router.get('/:id/related',     getRelatedProducts);
router.get('/:id/reviews',     getProductReviews);
router.post('/:id/reviews', protect, validate(reviewSchema), createProductReview);

export default router;

import { Router } from 'express';
import {
  getProducts, getBrowseProducts, getHomeProducts, getProductFacets, getProductById, getRelatedProducts,
  getProductReviews, createProductReview,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  listProductsQuerySchema, facetsQuerySchema, reviewSchema,
} from '../validators/products.schema.js';

const router = Router();

// Listing + faceting (public, validated query params)
router.get('/',        validateQuery(listProductsQuerySchema), getProducts);
router.get('/browse',  validateQuery(listProductsQuerySchema), getBrowseProducts);
router.get('/home',    getHomeProducts);
router.get('/facets',  validateQuery(facetsQuerySchema),       getProductFacets);

// Detail + related + reviews (public)
router.get('/:id',          getProductById);
router.get('/:id/related',  getRelatedProducts);
router.get('/:id/reviews',  getProductReviews);

// Review submission (auth required)
router.post('/:id/reviews', protect, validate(reviewSchema), createProductReview);

export default router;

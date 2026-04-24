import { Router } from 'express';
import { getProducts, getProductById, getRelatedProducts } from '../controllers/productController.js';

const router = Router();

router.get('/',              getProducts);
router.get('/:id',           getProductById);
router.get('/:id/related',   getRelatedProducts);

export default router;

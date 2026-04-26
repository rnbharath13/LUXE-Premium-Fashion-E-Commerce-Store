import { Router } from 'express';
import { z } from 'zod';
import { reverseGeocode } from '../controllers/locationController.js';
import { protect } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';

const router = Router();

const reverseGeocodeQuerySchema = z.object({
  lat: z.coerce.number().gte(-90).lte(90),
  lng: z.coerce.number().gte(-180).lte(180),
}).strict();

router.get('/reverse-geocode', protect, validateQuery(reverseGeocodeQuerySchema), reverseGeocode);

export default router;

import { z } from 'zod';

const TAGS = ['New Arrival', 'Sale', 'Best Seller', 'Premium', 'Trending'];
const SORTS = ['featured', 'price-asc', 'price-desc', 'rating', 'newest', 'relevance'];

// Comma-separated list helper: "a,b" or ["a","b"] → ["a","b"]; empty → undefined.
const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => {
    if (v == null) return undefined;
    const arr = Array.isArray(v) ? v : v.split(',');
    const cleaned = arr.map((s) => s.trim()).filter(Boolean);
    return cleaned.length ? cleaned : undefined;
  });

export const listProductsQuerySchema = z.object({
  q:           z.string().trim().min(1).max(200).optional(),
  category:    z.string().trim().min(1).max(100).optional(),
  subcategory: z.string().trim().min(1).max(100).optional(),
  brand:       csv,                                              // multiple allowed
  tag:         csv.refine(                                       // also accepts single
    (arr) => !arr || arr.every((t) => TAGS.includes(t)),
    { message: `tag must be one of: ${TAGS.join(', ')}` },
  ),
  size:        csv,
  color:       csv,
  minPrice:    z.coerce.number().nonnegative().max(1_000_000).optional(),
  maxPrice:    z.coerce.number().nonnegative().max(1_000_000).optional(),
  sortBy:      z.enum(SORTS).default('featured'),
  limit:       z.coerce.number().int().positive().max(100).default(24),
  skip:        z.coerce.number().int().nonnegative().max(10_000).default(0),
}).strict().refine(
  (d) => d.minPrice == null || d.maxPrice == null || d.minPrice <= d.maxPrice,
  { message: 'minPrice cannot exceed maxPrice', path: ['minPrice'] },
);

export const facetsQuerySchema = z.object({
  category:    z.string().trim().min(1).max(100).optional(),
  subcategory: z.string().trim().min(1).max(100).optional(),
}).strict();

export const reviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
});

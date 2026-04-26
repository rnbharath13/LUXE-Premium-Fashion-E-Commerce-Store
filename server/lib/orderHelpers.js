import crypto from 'crypto';

// ORD-YYYYMMDD-XXXXXX  (6 hex chars → 16M space, collision-resistant per day)
export const generateOrderNumber = () => {
  const ymd  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${ymd}-${rand}`;
};

// Find variant matching size+color (both optional). Returns null if no match.
export const findVariant = (variants = [], size, color) => {
  if (!size && !color) return null;
  return variants.find((v) =>
    (size  ? v.size  === size  : true) &&
    (color ? v.color === color : true)
  ) || null;
};

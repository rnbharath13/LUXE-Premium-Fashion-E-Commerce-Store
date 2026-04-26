// Authoritative checkout constants — server is the source of truth.
// Frontend mirrors these in src/lib/checkout.js for display, but server recomputes on order creation.
export const TAX_RATE                 = 0.08;
export const SHIPPING_COST            = 9.99;
export const FREE_SHIPPING_THRESHOLD  = 150;
export const MAX_ITEMS_PER_ORDER      = 50;
export const MAX_QUANTITY_PER_LINE    = 99;

export const round2 = (n) => Math.round(n * 100) / 100;

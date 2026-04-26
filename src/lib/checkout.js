// Display-only mirrors of server constants. Server is authoritative — these are for the order summary preview.
export const TAX_RATE                = 0.08;
export const SHIPPING_COST           = 9.99;
export const FREE_SHIPPING_THRESHOLD = 150;

export const round2 = (n) => Math.round(n * 100) / 100;

export const computeTotals = (items) => {
  const subtotal     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax          = subtotal * TAX_RATE;
  const total        = subtotal + shippingCost + tax;
  return {
    subtotal:     round2(subtotal),
    shippingCost: round2(shippingCost),
    tax:          round2(tax),
    total:        round2(total),
  };
};

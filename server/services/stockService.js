import { supabase } from '../config/supabase.js';

// ──────────────────────────────────────────────────────────────────────────
// Stock service — wraps the SQL functions defined in migration 006.
// Both functions are atomic (use SELECT ... FOR UPDATE inside plpgsql) so
// concurrent callers cannot oversell the last unit.
// ──────────────────────────────────────────────────────────────────────────

const NULL_OR_VAL = (v) => (v && v !== 'One Size' ? v : null);

/**
 * Decrement stock for one line. Returns true on success, false if there
 * isn't enough stock. The DB function locks the row for the duration of
 * its update — race-safe under concurrent orders.
 *
 * Caller is responsible for the saga: on a `false` return, any earlier
 * decrements in the same order MUST be restored before responding to client.
 */
export const decrementStock = async ({ productId, size, color, quantity }) => {
  const { data, error } = await supabase.rpc('decrement_stock', {
    p_product_id: productId,
    p_size:       NULL_OR_VAL(size),
    p_color:      NULL_OR_VAL(color),
    p_qty:        quantity,
  });
  if (error) throw error;
  return data === true;
};

/**
 * Restore stock for one line — used by cancel and return flows.
 * Always succeeds (the DB function is unconditional).
 */
export const restoreStock = async ({ productId, size, color, quantity }) => {
  const { error } = await supabase.rpc('restore_stock', {
    p_product_id: productId,
    p_size:       NULL_OR_VAL(size),
    p_color:      NULL_OR_VAL(color),
    p_qty:        quantity,
  });
  if (error) throw error;
};

/**
 * Restore stock for every line item of a given order. Used when an order
 * is cancelled or a return is approved. Continues on individual failures so
 * a single broken row doesn't strand the rest of the inventory.
 */
export const restoreStockForOrder = async (orderItems = []) => {
  for (const item of orderItems) {
    try {
      await restoreStock({
        productId: item.product_id,
        size:      item.size,
        color:     item.color,
        quantity:  item.quantity,
      });
    } catch (err) {
      // Log but don't throw — partial restoration is better than aborting.
      // Inventory drift here is recoverable manually via the admin module.
      console.error('restore_stock failed for', item.product_id, err);
    }
  }
};

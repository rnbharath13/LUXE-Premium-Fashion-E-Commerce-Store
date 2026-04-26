import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, X, MapPin, CreditCard, AlertCircle, Undo2 } from 'lucide-react';
import useStore from '../../store/useStore';
import './OrderDetail.css';

const RETURN_WINDOW_DAYS    = 14;
const CANCELLABLE_STATUSES  = ['pending', 'processing'];
const RETURNABLE_STATUSES   = ['shipped', 'delivered'];

const STATUS_CONFIG = {
  pending:    { icon: Clock,       label: 'Pending',    cls: 'od-status-pending'    },
  processing: { icon: Clock,       label: 'Processing', cls: 'od-status-processing' },
  shipped:    { icon: Truck,       label: 'Shipped',    cls: 'od-status-shipped'    },
  delivered:  { icon: CheckCircle, label: 'Delivered',  cls: 'od-status-delivered'  },
  cancelled:  { icon: X,           label: 'Cancelled',  cls: 'od-status-cancelled'  },
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchOrder, cancelOrder, requestReturn, showToast, user } = useStore();

  const [order,        setOrder]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [cancelling,   setCancelling]   = useState(false);
  const [returnOpen,   setReturnOpen]   = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returning,    setReturning]    = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    fetchOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message || 'Could not load order'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order? Your card will be refunded if it was paid.')) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder({ ...order, status: updated.status, payment_status: updated.payment_status });
      showToast('Order cancelled');
    } catch (err) {
      showToast(err.message || 'Could not cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (returnReason.trim().length < 5) {
      showToast('Tell us why you\'re returning (at least 5 characters)', 'error');
      return;
    }
    setReturning(true);
    try {
      const result = await requestReturn(order.id, returnReason.trim());
      // Server flips status to 'cancelled' + payment_status to 'refunded' on auto-approval.
      setOrder({
        ...order,
        status:         'cancelled',
        payment_status: 'refunded',
        order_returns:  [...(order.order_returns || []), result.return],
      });
      setReturnOpen(false);
      setReturnReason('');
      showToast('Return processed and refund issued');
    } catch (err) {
      showToast(err.message || 'Could not process return', 'error');
    } finally {
      setReturning(false);
    }
  };

  if (loading) return (
    <div className="od-page"><div className="od-inner"><p className="od-loading">Loading order...</p></div></div>
  );

  if (error || !order) return (
    <div className="od-page">
      <div className="od-inner">
        <div className="od-error">
          <AlertCircle size={32} />
          <p className="od-error-title">{error || 'Order not found'}</p>
          <Link to="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    </div>
  );

  const cfg        = STATUS_CONFIG[order.status?.toLowerCase()] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const ship       = order.shipping_address || {};
  const items      = order.order_items || [];

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  // Return eligibility — shipped/delivered, paid, within 14 days, no existing return.
  const ageDays    = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const hasReturn  = (order.order_returns || []).length > 0;
  const canReturn  = RETURNABLE_STATUSES.includes(order.status)
                  && order.payment_status === 'paid'
                  && ageDays <= RETURN_WINDOW_DAYS
                  && !hasReturn;
  const existingReturn = (order.order_returns || [])[0];

  return (
    <div className="od-page animate-fade-in">
      <div className="od-inner">
        <Link to="/orders" className="od-back-link">
          <ArrowLeft size={15} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="od-header">
          <div>
            <p className="section-label">Order</p>
            <h1 className="od-title">#{order.order_number}</h1>
            <p className="od-date">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className={`od-status-badge ${cfg.cls}`}>
            <StatusIcon size={13} /> {cfg.label}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="od-card">
              <h2 className="od-card-title">
                <Package size={16} /> Items ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const product = item.products;
                  const img     = product?.product_images?.find((i) => i.is_primary)?.image_url
                                || product?.product_images?.[0]?.image_url
                                || FALLBACK_IMG;
                  return (
                    <div key={item.id} className="od-item">
                      <Link to={product ? `/product/${product.slug || product.id}` : '#'} className="od-item-img">
                        <img src={img} alt={product?.name || 'Product'} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="od-item-name">{product?.name || 'Product unavailable'}</p>
                        <p className="od-item-meta">
                          Qty: {item.quantity}
                          {item.size && item.size !== 'One Size' && ` · Size ${item.size}`}
                        </p>
                      </div>
                      <span className="od-item-price">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping address */}
            <div className="od-card">
              <h2 className="od-card-title"><MapPin size={16} /> Shipping Address</h2>
              <p className="od-address-body">
                {ship.fullName}<br/>
                {ship.line1}{ship.line2 ? `, ${ship.line2}` : ''}<br/>
                {ship.city}{ship.state ? `, ${ship.state}` : ''} {ship.postalCode}<br/>
                {ship.country}
                {ship.phone && <><br/>Phone: {ship.phone}</>}
              </p>
            </div>

            {/* Payment */}
            <div className="od-card">
              <h2 className="od-card-title"><CreditCard size={16} /> Payment</h2>
              <p className="od-address-body">
                Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card'}<br/>
                Status: <span className={`od-payment-status od-payment-${order.payment_status || 'pending'}`}>
                  {(order.payment_status || 'pending').toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="od-summary-wrap">
            <div className="od-summary">
              <h3 className="od-summary-title">Total Summary</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Subtotal', `$${Number(order.subtotal).toFixed(2)}`,                                false],
                  ['Shipping', Number(order.shipping_cost) === 0 ? 'Free' : `$${Number(order.shipping_cost).toFixed(2)}`, Number(order.shipping_cost) === 0],
                  ['Tax',      `$${Number(order.tax).toFixed(2)}`,                                     false],
                ].map(([label, val, isFree]) => (
                  <div key={label} className="od-summary-row">
                    <span className="od-summary-label">{label}</span>
                    <span className={isFree ? 'od-summary-value-free' : 'od-summary-value'}>{val}</span>
                  </div>
                ))}
                <div className="od-summary-total-row">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              {canCancel && (
                <button onClick={handleCancel} disabled={cancelling} className="od-cancel-btn">
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              {canReturn && (
                <button onClick={() => setReturnOpen(true)} className="od-return-btn">
                  <Undo2 size={13} /> Request Return
                </button>
              )}

              {existingReturn && (
                <div className="od-return-status">
                  <p className="od-return-status-title">Return {existingReturn.status}</p>
                  <p className="od-return-status-amount">
                    Refund: ${Number(existingReturn.refund_amount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {returnOpen && (
          <div className="od-modal-overlay" onClick={() => !returning && setReturnOpen(false)}>
            <div className="od-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="od-modal-title">Request Return</h3>
              <p className="od-modal-desc">
                Refund of <strong>${Number(order.total).toFixed(2)}</strong> will be issued to your original payment method.
                Stock for the items will be restored.
              </p>
              <form onSubmit={handleSubmitReturn}>
                <label htmlFor="return-reason" className="od-modal-label">Why are you returning this order?</label>
                <textarea
                  id="return-reason"
                  className="od-modal-textarea"
                  rows={4}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Item didn't fit, wrong size, not as described…"
                  required
                  minLength={5}
                  maxLength={1000}
                  autoFocus
                />
                <div className="od-modal-actions">
                  <button type="button" onClick={() => setReturnOpen(false)} disabled={returning} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={returning || returnReason.trim().length < 5} className="btn-primary">
                    {returning ? 'Processing…' : 'Confirm Return'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

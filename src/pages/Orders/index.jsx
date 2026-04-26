import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ArrowRight, ShoppingBag, X, AlertCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import './Orders.css';

const statusConfig = {
  pending:    { icon: Clock,       cls: 'order-status-processing', label: 'pending'    },
  processing: { icon: Clock,       cls: 'order-status-processing', label: 'processing' },
  shipped:    { icon: Truck,       cls: 'order-status-shipped',    label: 'shipped'    },
  delivered:  { icon: CheckCircle, cls: 'order-status-delivered',  label: 'delivered'  },
  cancelled:  { icon: X,           cls: 'order-status-processing', label: 'cancelled'  },
};

export default function Orders() {
  const { user, orders, fetchOrders } = useStore();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError('');
    fetchOrders()
      .catch((err) => setError(err.message || 'Could not load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="orders-unauthenticated">
      <div className="orders-unauthenticated-inner">
        <Package size={44} className="orders-unauth-icon" />
        <h2 className="orders-unauth-title">Sign in to view orders</h2>
        <Link to="/login" className="btn-primary mt-4">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="orders-page animate-fade-in">
      <div className="orders-page-inner">
        <p className="section-label">Account</p>
        <h1 className="orders-page-title">My Orders</h1>
        <p className="orders-page-count">
          {loading ? 'Loading...' : `${orders.length} order${orders.length === 1 ? '' : 's'} total`}
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="orders-skeleton" />)}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <AlertCircle size={44} className="orders-unauth-icon mx-auto mb-4" />
            <h2 className="orders-unauth-title">{error}</h2>
            <button onClick={() => location.reload()} className="btn-primary mt-4">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={44} className="orders-unauth-icon mx-auto mb-4" />
            <h2 className="orders-unauth-title">No orders yet</h2>
            <Link to="/shop" className="btn-primary mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const cfg        = statusConfig[order.status?.toLowerCase()] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const itemCount  = order.order_items?.length || 0;
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="order-card order-card-link"
                >
                  <div className="order-card-header">
                    <div>
                      <div className="flex items-center">
                        <h3 className="order-id">{order.order_number}</h3>
                        <span className={`order-status-badge ${cfg.cls}`}>
                          <StatusIcon size={11} /> {cfg.label}
                        </span>
                      </div>
                      <p className="order-date">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="order-total">${Number(order.total).toFixed(2)}</span>
                  </div>
                  <div className="order-card-footer">
                    <div className="order-meta">
                      <span className="order-meta-item"><Package size={13} /> {itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="order-reorder-btn">
                      View Details <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

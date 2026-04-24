import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import useStore from '../../store/useStore';
import './Orders.css';

const statusConfig = {
  delivered:  { icon: CheckCircle, cls: 'order-status-delivered' },
  processing: { icon: Clock,       cls: 'order-status-processing' },
  shipped:    { icon: Truck,       cls: 'order-status-shipped'    },
  pending:    { icon: Clock,       cls: 'order-status-processing' },
  cancelled:  { icon: Package,     cls: 'order-status-processing' },
};

export default function Orders() {
  const { user, orders, fetchOrders } = useStore();

  useEffect(() => {
    if (user) fetchOrders();
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
        <p className="orders-page-count">{orders.length} orders total</p>

        {orders.length === 0 ? (
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
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <div className="flex items-center">
                        <h3 className="order-id">{order.order_number}</h3>
                        <span className={`order-status-badge ${cfg.cls}`}>
                          <StatusIcon size={11} /> {order.status}
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
                    <Link to="/shop" className="order-reorder-btn">
                      Shop Again <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import useStore from '../store/useStore';

const statusConfig = {
  Delivered: { icon: CheckCircle, color: '#2d6a4f', bg: 'rgba(45,106,79,0.08)', border: 'rgba(45,106,79,0.2)' },
  Processing: { icon: Clock, color: '#8b7355', bg: 'rgba(139,115,85,0.08)', border: 'rgba(139,115,85,0.2)' },
  Shipped: { icon: Truck, color: '#4a6fa5', bg: 'rgba(74,111,165,0.08)', border: 'rgba(74,111,165,0.2)' },
};

export default function Orders() {
  const { user, orders } = useStore();

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <Package size={44} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Sign in to view orders
        </h2>
        <Link to="/login" className="btn-primary mt-4">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <p className="section-label">Account</p>
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          My Orders
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          {orders.length} orders total
        </p>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={44} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No orders yet</h2>
            <Link to="/shop" className="btn-primary mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.Processing;
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={order.id}
                  className="p-6 transition-all"
                  style={{ background: '#fff', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{order.id}</h3>
                        <span
                          className="px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1.5"
                          style={{ background: cfg.bg, color: cfg.color, border: '1px solid ' + cfg.border }}
                        >
                          <StatusIcon size={11} /> {order.status}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Placed on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1.5">
                        <Package size={13} /> {order.items} item{order.items !== 1 ? 's' : ''}
                      </span>
                      {order.tracking && (
                        <span className="flex items-center gap-1.5">
                          <Truck size={13} /> {order.tracking}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/shop"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors hover:text-black"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Reorder <ArrowRight size={13} />
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

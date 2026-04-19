import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity } = useStore();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  if (!cartOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setCartOpen(false)} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col animate-slide-in-right"
        style={{ background: '#ffffff', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} style={{ color: 'var(--text-primary)' }} />
            <h2
              className="text-base font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              Your Bag
            </h2>
            {count > 0 && (
              <span
                className="text-xs font-semibold px-2 py-0.5"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1.5 transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Your bag is empty
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Discover amazing products
                </p>
              </div>
              <button onClick={() => setCartOpen(false)}>
                <Link to="/shop" className="btn-primary text-sm">
                  Explore Shop
                </Link>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id + '-' + item.selectedSize + '-' + item.selectedColor}
                className="flex gap-3 p-3"
                style={{ border: '1px solid var(--border)' }}
              >
                {/* Image */}
                <div
                  className="flex-shrink-0 overflow-hidden"
                  style={{ width: 68, height: 80, background: 'var(--bg-secondary)' }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {item.emoji}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.brand}
                  </p>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.name}
                  </p>
                  {item.selectedSize && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Size: {item.selectedSize}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center border transition-colors hover:bg-gray-100"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center" style={{ color: 'var(--text-primary)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border transition-colors hover:bg-gray-100"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                  className="self-start mt-1 p-1 transition-colors hover:text-red-500"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Taxes &amp; shipping calculated at checkout
            </p>
            <Link
              to="/checkout"
              onClick={() => setCartOpen(false)}
              className="btn-primary w-full justify-center"
            >
              Checkout <ArrowRight size={16} />
            </Link>
            <Link
              to="/cart"
              onClick={() => setCartOpen(false)}
              className="btn-ghost w-full justify-center text-sm"
            >
              View Full Bag
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

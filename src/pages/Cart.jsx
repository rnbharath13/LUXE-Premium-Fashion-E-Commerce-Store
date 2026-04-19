import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import useStore from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, showToast } = useStore();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const suggestions = products.filter((p) => !cart.find((c) => c.id === p.id)).slice(0, 4);
  const shipping = total > 150 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="section-label">Your</p>
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Shopping Bag
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          {count} item{count !== 1 ? 's' : ''}
        </p>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <ShoppingBag size={52} style={{ color: 'var(--text-muted)' }} />
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Your bag is empty
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Start shopping to fill it up</p>
            </div>
            <Link to="/shop" className="btn-primary px-8 py-3">
              Explore Shop <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id + item.selectedSize + item.selectedColor}
                  className="flex gap-4 p-4"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <Link
                    to={'/product/' + item.id}
                    className="flex-shrink-0 overflow-hidden"
                    style={{ width: 96, height: 116, background: 'var(--bg-secondary)' }}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.brand}</p>
                        <Link
                          to={'/product/' + item.id}
                          className="text-sm font-semibold transition-colors hover:text-black"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {item.name}
                        </Link>
                        {item.selectedSize && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Size: {item.selectedSize}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => { removeFromCart(item.id, item.selectedSize, item.selectedColor); showToast('Item removed', 'info'); }}
                        className="p-1 transition-colors hover:text-red-500"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center" style={{ border: '1px solid var(--border)' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-gray-100"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-sm font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-gray-100"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="p-6 sticky top-24" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h2 className="text-base font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--text-primary)' }}>
                  Order Summary
                </h2>
                <div className="space-y-3 mb-5">
                  {[
                    ['Subtotal', `$${total.toFixed(2)}`],
                    ['Shipping', shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`],
                    ['Tax (8%)', `$${tax.toFixed(2)}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      <span
                        style={{ color: label === 'Shipping' && shipping === 0 ? '#2d6a4f' : 'var(--text-primary)', fontWeight: 500 }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-4 border-t border-b mb-5" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
                {/* Promo */}
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 relative">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input placeholder="Promo code" className="input-field pl-8 h-10 text-sm" />
                  </div>
                  <button className="px-4 h-10 text-sm font-semibold text-white" style={{ background: '#1c1c1c' }}>
                    Apply
                  </button>
                </div>
                {total > 150 && (
                  <p className="text-xs mb-4 font-medium" style={{ color: '#2d6a4f' }}>
                    ✓ You qualify for free shipping!
                  </p>
                )}
                <Link to="/checkout" className="btn-primary w-full justify-center py-3">
                  Checkout <ArrowRight size={16} />
                </Link>
                <Link to="/shop" className="btn-ghost w-full justify-center text-sm mt-3">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-20">
            <h2
              className="text-2xl font-bold mb-8"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
            >
              You Might Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

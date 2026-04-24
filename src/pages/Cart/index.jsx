import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import useStore from '../../store/useStore';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, showToast } = useStore();
  const total       = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count       = cart.reduce((s, i) => s + i.quantity, 0);
  const suggestions = [];
  const shipping    = total > 150 ? 0 : 9.99;
  const tax         = total * 0.08;
  const grandTotal  = total + shipping + tax;

  return (
    <div className="cart-page animate-fade-in">
      <div className="cart-page-inner">
        <p className="section-label">Your</p>
        <h1 className="cart-page-title">Shopping Bag</h1>
        <p className="cart-page-subtitle">{count} item{count !== 1 ? 's' : ''}</p>

        {cart.length === 0 ? (
          <div className="cart-page-empty">
            <ShoppingBag size={52} className="cart-empty-state-icon" />
            <div>
              <h2 className="cart-empty-state-title">Your bag is empty</h2>
              <p className="cart-empty-state-desc">Start shopping to fill it up</p>
            </div>
            <Link to="/shop" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Explore Shop <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => (
                <div key={item.id + item.selectedSize + item.selectedColor} className="cart-page-item">
                  <Link to={'/product/' + item.id} className="cart-page-item-img">
                    {item.image && <img src={item.image} alt={item.name} />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="cart-page-item-brand">{item.brand}</p>
                        <Link to={'/product/' + item.id} className="cart-page-item-name block">{item.name}</Link>
                        {item.selectedSize && <p className="cart-page-item-size">Size: {item.selectedSize}</p>}
                      </div>
                      <button
                        className="cart-page-item-remove"
                        onClick={() => { removeFromCart(item.id, item.selectedSize, item.selectedColor); showToast('Item removed', 'info'); }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="cart-page-qty-wrap">
                        <button className="cart-page-qty-btn" onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}><Minus size={12} /></button>
                        <span className="cart-page-qty-val">{item.quantity}</span>
                        <button className="cart-page-qty-btn" onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}><Plus size={12} /></button>
                      </div>
                      <span className="cart-page-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="cart-summary">
                <h2 className="cart-summary-title">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {[
                    ['Subtotal', `$${total.toFixed(2)}`,    false],
                    ['Shipping', shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`, shipping === 0],
                    ['Tax (8%)', `$${tax.toFixed(2)}`,      false],
                  ].map(([label, val, isFree]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="cart-summary-label">{label}</span>
                      <span className={isFree ? 'cart-summary-value-free' : 'cart-summary-value'}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-4 border-t border-b mb-5" style={{ borderColor: 'var(--border)' }}>
                  <span className="cart-summary-total-label">Total</span>
                  <span className="cart-summary-total-value">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 relative">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input placeholder="Promo code" className="input-field pl-8 h-10 text-sm" />
                  </div>
                  <button className="cart-promo-apply-btn">Apply</button>
                </div>
                {total > 150 && <p className="cart-summary-free-ship">✓ You qualify for free shipping!</p>}
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
            <h2 className="cart-suggestions-title">You Might Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity } = useStore();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  if (!cartOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setCartOpen(false)} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <ShoppingBag size={18} className="cart-header-icon" />
            <h2 className="cart-header-title">Your Bag</h2>
            {count > 0 && (
              <span className="cart-count-tag">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button onClick={() => setCartOpen(false)} className="cart-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-body scrollbar-hide">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={40} className="cart-empty-icon" />
              <div>
                <p className="cart-empty-title">Your bag is empty</p>
                <p className="cart-empty-desc">Discover amazing products</p>
              </div>
              <button onClick={() => setCartOpen(false)}>
                <Link to="/shop" className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  Explore Shop
                </Link>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id + '-' + item.selectedSize + '-' + item.selectedColor} className="cart-item">
                <div className="cart-item-img">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <div className="flex items-center justify-center w-full h-full text-2xl">{item.emoji}</div>}
                </div>
                <div className="cart-item-info">
                  <p className="cart-item-brand">{item.brand}</p>
                  <p className="cart-item-name">{item.name}</p>
                  {item.selectedSize && <p className="cart-item-size">Size: {item.selectedSize}</p>}
                  <div className="cart-item-bottom">
                    <div className="cart-qty-controls">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                      >
                        <Minus size={10} />
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  className="cart-remove-btn"
                  onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-footer-row">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-value">${total.toFixed(2)}</span>
            </div>
            <p className="cart-footer-note">Taxes &amp; shipping calculated at checkout</p>
            <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-primary w-full justify-center">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/cart" onClick={() => setCartOpen(false)} className="btn-ghost w-full justify-center" style={{ fontSize: '0.875rem' }}>
              View Full Bag
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

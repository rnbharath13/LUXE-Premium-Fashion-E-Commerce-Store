import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard, MapPin, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import useStore from '../../store/useStore';
import './Checkout.css';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const [step,    setStep]    = useState(0);
  const [placing, setPlacing] = useState(false);
  const [placed,  setPlaced]  = useState(false);
  const { cart, clearCart }   = useStore();
  const total      = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping   = total > 150 ? 0 : 9.99;
  const tax        = total * 0.08;
  const grandTotal = total + shipping + tax;

  const [shippingInfo, setShippingInfo] = useState({ firstName: '', lastName: '', email: '', address: '', city: '', zip: '' });
  const [payment,      setPayment]      = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });

  const handlePlace = () => {
    setPlacing(true);
    setTimeout(() => { clearCart(); setPlaced(true); setPlacing(false); }, 2000);
  };

  if (placed) return (
    <div className="checkout-success animate-fade-in">
      <div className="checkout-success-inner">
        <div className="checkout-success-icon-wrap">
          <Check size={36} className="checkout-success-icon" />
        </div>
        <h1 className="checkout-success-title">Order Placed!</h1>
        <p className="checkout-success-desc">Thank you for your purchase. Your order has been confirmed.</p>
        <p className="checkout-success-order-id">#ORD-{Math.floor(Math.random() * 9000 + 1000)}</p>
        <div className="space-y-3">
          <Link to="/orders" className="btn-primary w-full justify-center">View Orders <ArrowRight size={16} /></Link>
          <Link to="/"       className="btn-ghost  w-full justify-center">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="checkout-success">
      <div className="checkout-success-inner">
        <p className="checkout-success-title">Your bag is empty</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    </div>
  );

  const labelCls = 'auth-label';
  const fieldCls = 'input-field mb-1';

  return (
    <div className="checkout-page animate-fade-in">
      <div className="checkout-page-inner">
        <Link to="/cart" className="checkout-back-link">
          <ArrowLeft size={15} /> Back to Bag
        </Link>

        {/* Steps */}
        <div className="checkout-steps">
          {STEPS.map((s, i) => (
            <div key={s} className="checkout-step-item">
              <div className="flex items-center gap-2">
                <div className={`checkout-step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`checkout-step-label hidden sm:block ${i === step ? 'active' : 'pending'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`checkout-step-connector ${i < step ? 'done' : 'pending'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="checkout-form-card">
              {step === 0 && (
                <div>
                  <h2 className="checkout-section-title">
                    <MapPin size={18} className="checkout-section-title-icon" /> Shipping Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'First Name', key: 'firstName', span: 1, ph: 'John' },
                      { label: 'Last Name',  key: 'lastName',  span: 1, ph: 'Doe' },
                      { label: 'Email',      key: 'email',     span: 2, ph: 'john@example.com', type: 'email' },
                      { label: 'Address',    key: 'address',   span: 2, ph: '123 Main St' },
                      { label: 'City',       key: 'city',      span: 1, ph: 'New York' },
                      { label: 'ZIP Code',   key: 'zip',       span: 1, ph: '10001' },
                    ].map(({ label, key, span, ph, type }) => (
                      <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>{label}</label>
                        <input type={type || 'text'} className={fieldCls} value={shippingInfo[key]} onChange={(e) => setShippingInfo({ ...shippingInfo, [key]: e.target.value })} placeholder={ph} />
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary mt-6 w-full justify-center" onClick={() => setStep(1)}>
                    Continue to Payment <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="checkout-section-title">
                    <CreditCard size={18} className="checkout-section-title-icon" /> Payment
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Cardholder Name', key: 'cardName',   ph: 'John Doe' },
                      { label: 'Card Number',     key: 'cardNumber', ph: '4242 4242 4242 4242' },
                    ].map(({ label, key, ph }) => (
                      <div key={key}>
                        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>{label}</label>
                        <input className={fieldCls} value={payment[key]} onChange={(e) => setPayment({ ...payment, [key]: e.target.value })} placeholder={ph} />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      {[{ label: 'Expiry', key: 'expiry', ph: 'MM/YY' }, { label: 'CVV', key: 'cvv', ph: '123' }].map(({ label, key, ph }) => (
                        <div key={key}>
                          <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>{label}</label>
                          <input className={fieldCls} value={payment[key]} onChange={(e) => setPayment({ ...payment, [key]: e.target.value })} placeholder={ph} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="checkout-secure-notice">
                    <Lock size={13} className="checkout-secure-notice-icon" />
                    <span className="checkout-secure-notice-label">Your payment info is encrypted and secure</span>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(0)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn-primary flex-1 justify-center" onClick={() => setStep(2)}>Review Order <ArrowRight size={15} /></button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="checkout-section-title">Review Order</h2>
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.id + item.selectedSize} className="checkout-review-item">
                        <div className="checkout-review-item-img">
                          {item.image && <img src={item.image} alt={item.name} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="checkout-review-item-name">{item.name}</p>
                          <p className="checkout-review-item-meta">Qty: {item.quantity}{item.selectedSize ? ` · ${item.selectedSize}` : ''}</p>
                        </div>
                        <span className="checkout-review-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
                    <button className="btn-primary flex-1 justify-center" onClick={handlePlace} disabled={placing}>
                      {placing ? <><span className="auth-spinner" /> Placing...</> : <><Lock size={15} /> Place Order</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Order Summary</h3>
            <div className="space-y-3 text-sm mb-4">
              {cart.map((i) => (
                <div key={i.id + i.selectedSize} className="checkout-summary-row">
                  <span className="checkout-summary-item-name">{i.name} ×{i.quantity}</span>
                  <span className="checkout-summary-item-price">${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm" style={{ borderColor: 'var(--border)' }}>
              {[
                ['Subtotal', `$${total.toFixed(2)}`,                              false],
                ['Shipping', shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`, shipping === 0],
                ['Tax',      `$${tax.toFixed(2)}`,                                false],
              ].map(([label, val, isFree]) => (
                <div key={label} className="checkout-summary-row">
                  <span className="checkout-summary-label">{label}</span>
                  <span className={isFree ? 'checkout-summary-value-free' : 'checkout-summary-value'}>{val}</span>
                </div>
              ))}
              <div className="checkout-summary-total-row">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

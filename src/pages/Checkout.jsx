import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard, MapPin, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import useStore from '../store/useStore';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const { cart, clearCart } = useStore();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = total > 150 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  const [shippingInfo, setShippingInfo] = useState({ firstName: '', lastName: '', email: '', address: '', city: '', zip: '' });
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });

  const handlePlace = () => {
    setPlacing(true);
    setTimeout(() => { clearCart(); setPlaced(true); setPlacing(false); }, 2000);
  };

  if (placed) return (
    <div className="min-h-screen flex items-center justify-center animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
      <div className="text-center max-w-md px-4">
        <div
          className="w-20 h-20 flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(45,106,79,0.1)', border: '2px solid rgba(45,106,79,0.3)' }}
        >
          <Check size={36} style={{ color: '#2d6a4f' }} />
        </div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Order Placed!
        </h1>
        <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <p className="text-sm font-bold mb-8" style={{ color: 'var(--accent)' }}>
          #ORD-{Math.floor(Math.random() * 9000 + 1000)}
        </p>
        <div className="space-y-3">
          <Link to="/orders" className="btn-primary w-full justify-center">
            View Orders <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn-ghost w-full justify-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <p className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your bag is empty</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    </div>
  );

  const labelCls = 'text-xs font-bold uppercase tracking-wider mb-1.5 block';
  const fieldCls = 'input-field mb-1';

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-black"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={15} /> Back to Bag
        </Link>

        {/* Steps */}
        <div className="flex items-center justify-center gap-0 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: i < step ? '#2d6a4f' : i === step ? '#1c1c1c' : 'transparent',
                    color: i <= step ? '#fff' : 'var(--text-muted)',
                    border: i > step ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-wider hidden sm:block"
                  style={{ color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-16 h-px mx-3" style={{ background: i < step ? '#2d6a4f' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="p-6" style={{ background: '#fff', border: '1px solid var(--border)' }}>
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <MapPin size={18} style={{ color: 'var(--accent)' }} /> Shipping Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'First Name', key: 'firstName', span: 1, ph: 'John' },
                      { label: 'Last Name', key: 'lastName', span: 1, ph: 'Doe' },
                      { label: 'Email', key: 'email', span: 2, ph: 'john@example.com', type: 'email' },
                      { label: 'Address', key: 'address', span: 2, ph: '123 Main St' },
                      { label: 'City', key: 'city', span: 1, ph: 'New York' },
                      { label: 'ZIP Code', key: 'zip', span: 1, ph: '10001' },
                    ].map(({ label, key, span, ph, type }) => (
                      <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>{label}</label>
                        <input
                          type={type || 'text'} className={fieldCls}
                          value={shippingInfo[key]}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, [key]: e.target.value })}
                          placeholder={ph}
                        />
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
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <CreditCard size={18} style={{ color: 'var(--accent)' }} /> Payment
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Cardholder Name', key: 'cardName', ph: 'John Doe' },
                      { label: 'Card Number', key: 'cardNumber', ph: '4242 4242 4242 4242' },
                    ].map(({ label, key, ph }) => (
                      <div key={key}>
                        <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>{label}</label>
                        <input className={fieldCls} value={payment[key]} onChange={(e) => setPayment({ ...payment, [key]: e.target.value })} placeholder={ph} />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Expiry', key: 'expiry', ph: 'MM/YY' },
                        { label: 'CVV', key: 'cvv', ph: '123' },
                      ].map(({ label, key, ph }) => (
                        <div key={key}>
                          <label className={labelCls} style={{ color: 'var(--text-secondary)' }}>{label}</label>
                          <input className={fieldCls} value={payment[key]} onChange={(e) => setPayment({ ...payment, [key]: e.target.value })} placeholder={ph} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 mt-4 p-3"
                    style={{ background: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.2)' }}
                  >
                    <Lock size={13} style={{ color: '#2d6a4f' }} />
                    <span className="text-xs" style={{ color: '#2d6a4f' }}>Your payment info is encrypted and secure</span>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(0)}>
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button className="btn-primary flex-1 justify-center" onClick={() => setStep(2)}>
                      Review Order <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Review Order</h2>
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.id + item.selectedSize}
                        className="flex items-center gap-4 p-3"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                      >
                        <div className="w-12 h-14 flex-shrink-0 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Qty: {item.quantity}{item.selectedSize ? ` · ${item.selectedSize}` : ''}
                          </p>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(1)}>
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button className="btn-primary flex-1 justify-center" onClick={handlePlace} disabled={placing}>
                      {placing
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing...</>
                        : <><Lock size={15} /> Place Order</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 h-fit sticky top-24" style={{ background: '#fff', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>
              Order Summary
            </h3>
            <div className="space-y-3 text-sm mb-4">
              {cart.map((i) => (
                <div key={i.id + i.selectedSize} className="flex justify-between gap-2">
                  <span className="truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {i.name} ×{i.quantity}
                  </span>
                  <span className="font-semibold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                    ${(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm" style={{ borderColor: 'var(--border)' }}>
              {[
                ['Subtotal', `$${total.toFixed(2)}`],
                ['Shipping', shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`],
                ['Tax', `$${tax.toFixed(2)}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ color: label === 'Shipping' && shipping === 0 ? '#2d6a4f' : 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
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

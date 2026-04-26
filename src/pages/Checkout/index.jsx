import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, MapPin, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import useStore from '../../store/useStore';
import { computeTotals } from '../../lib/checkout';
import './Checkout.css';

const STEPS = ['Shipping', 'Payment', 'Review'];
const FORM_KEY = 'luxe-checkout-form';

const EMPTY_ADDRESS = {
  fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '',
};
const EMPTY_PAYMENT = { cardName: '', cardNumber: '', expiry: '', cvv: '' };

// ── Validation ──────────────────────────────────────────────────
const required = (v) => (v ?? '').toString().trim().length > 0;

const validateAddress = (a) => {
  const e = {};
  if (!required(a.fullName)   || a.fullName.trim().length   < 2) e.fullName   = 'Full name is required';
  if (!required(a.phone)      || a.phone.replace(/\D/g, '').length < 7) e.phone = 'Valid phone number is required';
  if (!required(a.line1)      || a.line1.trim().length      < 3) e.line1      = 'Address is required';
  if (!required(a.city)       || a.city.trim().length       < 2) e.city       = 'City is required';
  if (!required(a.state)      || a.state.trim().length      < 2) e.state      = 'State / region is required';
  if (!required(a.postalCode) || a.postalCode.trim().length < 3) e.postalCode = 'Postal code is required';
  if (!required(a.country)    || a.country.trim().length    < 2) e.country    = 'Country is required';
  return e;
};

const validatePayment = (p, method) => {
  if (method === 'cod') return {};
  const e = {};
  if (!required(p.cardName) || p.cardName.trim().length < 2) e.cardName = 'Cardholder name is required';
  const digits = (p.cardNumber || '').replace(/\s/g, '');
  if (!/^\d{12,19}$/.test(digits))           e.cardNumber = 'Enter a valid card number';
  if (!/^\d{2}\/\d{2}$/.test(p.expiry || '')) e.expiry     = 'Use MM/YY';
  if (!/^\d{3,4}$/.test(p.cvv || ''))         e.cvv        = '3–4 digit CVV';
  return e;
};

// ── Checkout component ─────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const { cart, user, placeOrder, showToast } = useStore();

  const [step,            setStep]            = useState(0);
  const [placing,         setPlacing]         = useState(false);
  const [placed,          setPlaced]          = useState(false);
  const [orderNum,        setOrderNum]        = useState('');
  const [error,           setError]           = useState('');
  const [errors,          setErrors]          = useState({});
  const [shipping,        setShipping]        = useState(EMPTY_ADDRESS);
  const [billing,         setBilling]         = useState(EMPTY_ADDRESS);
  const [billingSame,     setBillingSame]     = useState(true);
  const [paymentMethod,   setPaymentMethod]   = useState('card');
  const [payment,         setPayment]         = useState(EMPTY_PAYMENT);
  // Idempotency key: stable per checkout attempt — prevents duplicate orders on retry/double-click
  const [idempotencyKey]  = useState(() => crypto.randomUUID());

  // Restore form draft from sessionStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(FORM_KEY) || 'null');
      if (saved) {
        if (saved.shipping)      setShipping(saved.shipping);
        if (saved.billing)       setBilling(saved.billing);
        if (typeof saved.billingSame === 'boolean') setBillingSame(saved.billingSame);
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
      }
    } catch {}
  }, []);

  // Persist draft (excluding card details — never persist PCI data)
  useEffect(() => {
    sessionStorage.setItem(FORM_KEY, JSON.stringify({ shipping, billing, billingSame, paymentMethod }));
  }, [shipping, billing, billingSame, paymentMethod]);

  // Prefill name/email from user once
  useEffect(() => {
    if (user && !shipping.fullName) {
      setShipping((s) => ({ ...s, fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() }));
    }
  }, [user]);

  const totals = useMemo(() => computeTotals(cart), [cart]);

  // ── Handlers ─────────────────────────────────────────────────
  const updateShipping = (key, val) => {
    setShipping((s) => ({ ...s, [key]: val }));
    if (errors[`shipping.${key}`]) setErrors((e) => ({ ...e, [`shipping.${key}`]: undefined }));
  };
  const updateBilling = (key, val) => {
    setBilling((b) => ({ ...b, [key]: val }));
    if (errors[`billing.${key}`]) setErrors((e) => ({ ...e, [`billing.${key}`]: undefined }));
  };
  const updatePayment = (key, val) => {
    setPayment((p) => ({ ...p, [key]: val }));
    if (errors[`payment.${key}`]) setErrors((e) => ({ ...e, [`payment.${key}`]: undefined }));
  };

  const goNext = () => {
    if (step === 0) {
      const sErr = validateAddress(shipping);
      const bErr = billingSame ? {} : validateAddress(billing);
      const flat = {
        ...Object.fromEntries(Object.entries(sErr).map(([k, v]) => [`shipping.${k}`, v])),
        ...Object.fromEntries(Object.entries(bErr).map(([k, v]) => [`billing.${k}`, v])),
      };
      if (Object.keys(flat).length) { setErrors(flat); showToast('Please fix the errors above', 'error'); return; }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      const pErr = validatePayment(payment, paymentMethod);
      const flat = Object.fromEntries(Object.entries(pErr).map(([k, v]) => [`payment.${k}`, v]));
      if (Object.keys(flat).length) { setErrors(flat); showToast('Please fix the errors above', 'error'); return; }
      setErrors({});
      setStep(2);
    }
  };

  const handlePlace = async () => {
    if (placing) return;
    setPlacing(true);
    setError('');
    try {
      const items = cart.map((i) => ({
        productId: i.id,
        quantity:  i.quantity,
        size:      i.selectedSize,
        color:     i.selectedColor,
      }));
      const result = await placeOrder({
        items,
        shippingAddress: shipping,
        billingAddress:  billingSame ? shipping : billing,
        paymentMethod,
      }, idempotencyKey);
      sessionStorage.removeItem(FORM_KEY);
      setOrderNum(result.orderNumber);
      setPlaced(true);
    } catch (err) {
      setError(err.message || 'Order failed. Please try again.');
      showToast(err.message || 'Order failed', 'error');
    } finally {
      setPlacing(false);
    }
  };

  // ── Empty cart guard ─────────────────────────────────────────
  if (cart.length === 0 && !placed) return (
    <div className="checkout-success">
      <div className="checkout-success-inner">
        <p className="checkout-success-title">Your bag is empty</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    </div>
  );

  // ── Success screen ───────────────────────────────────────────
  if (placed) return (
    <div className="checkout-success animate-fade-in">
      <div className="checkout-success-inner">
        <div className="checkout-success-icon-wrap">
          <Check size={36} className="checkout-success-icon" />
        </div>
        <h1 className="checkout-success-title">Order Placed!</h1>
        <p className="checkout-success-desc">Thank you for your purchase. Your order has been confirmed.</p>
        <p className="checkout-success-order-id">#{orderNum}</p>
        <div className="space-y-3">
          <button onClick={() => navigate('/orders')} className="btn-primary w-full justify-center">
            View Orders <ArrowRight size={16} />
          </button>
          <Link to="/" className="btn-ghost w-full justify-center">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );

  const labelCls = 'auth-label';
  const fieldCls = 'input-field mb-1';

  // ── Render ───────────────────────────────────────────────────
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

              {/* Step 0: Shipping ────────────────────────────────── */}
              {step === 0 && (
                <div>
                  <h2 className="checkout-section-title">
                    <MapPin size={18} className="checkout-section-title-icon" /> Shipping Address
                  </h2>
                  <AddressFields
                    prefix="shipping"
                    value={shipping}
                    errors={errors}
                    onChange={updateShipping}
                    labelCls={labelCls}
                    fieldCls={fieldCls}
                  />

                  <div className="checkout-billing-toggle">
                    <label className="checkout-checkbox-label">
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={(e) => setBillingSame(e.target.checked)}
                      />
                      <span>Billing address same as shipping</span>
                    </label>
                  </div>

                  {!billingSame && (
                    <div className="mt-6">
                      <h2 className="checkout-section-title">
                        <MapPin size={18} className="checkout-section-title-icon" /> Billing Address
                      </h2>
                      <AddressFields
                        prefix="billing"
                        value={billing}
                        errors={errors}
                        onChange={updateBilling}
                        labelCls={labelCls}
                        fieldCls={fieldCls}
                      />
                    </div>
                  )}

                  <button className="btn-primary mt-6 w-full justify-center" onClick={goNext}>
                    Continue to Payment <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 1: Payment ─────────────────────────────────── */}
              {step === 1 && (
                <div>
                  <h2 className="checkout-section-title">
                    <CreditCard size={18} className="checkout-section-title-icon" /> Payment Method
                  </h2>

                  <div className="checkout-payment-methods">
                    {[
                      { value: 'card', label: 'Credit / Debit Card' },
                      { value: 'cod',  label: 'Cash on Delivery'    },
                    ].map((opt) => (
                      <label key={opt.value} className={`checkout-payment-option${paymentMethod === opt.value ? ' active' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mt-5">
                      <Field
                        label="Cardholder Name" cls={labelCls}
                        error={errors['payment.cardName']}
                      >
                        <input className={fieldCls} placeholder="John Doe"
                          value={payment.cardName}
                          onChange={(e) => updatePayment('cardName', e.target.value)} />
                      </Field>
                      <Field
                        label="Card Number" cls={labelCls}
                        error={errors['payment.cardNumber']}
                      >
                        <input className={fieldCls} placeholder="4242 4242 4242 4242"
                          inputMode="numeric"
                          value={payment.cardNumber}
                          onChange={(e) => updatePayment('cardNumber', e.target.value)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Expiry" cls={labelCls} error={errors['payment.expiry']}>
                          <input className={fieldCls} placeholder="MM/YY"
                            value={payment.expiry}
                            onChange={(e) => updatePayment('expiry', e.target.value)} />
                        </Field>
                        <Field label="CVV" cls={labelCls} error={errors['payment.cvv']}>
                          <input className={fieldCls} placeholder="123" inputMode="numeric"
                            value={payment.cvv}
                            onChange={(e) => updatePayment('cvv', e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  )}

                  <div className="checkout-secure-notice">
                    <Lock size={13} className="checkout-secure-notice-icon" />
                    <span className="checkout-secure-notice-label">
                      {paymentMethod === 'card'
                        ? 'Your payment info is encrypted and never stored.'
                        : 'Pay in cash when your order arrives at your door.'}
                    </span>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(0)}>
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button className="btn-primary flex-1 justify-center" onClick={goNext}>
                      Review Order <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Review ──────────────────────────────────── */}
              {step === 2 && (
                <div>
                  <h2 className="checkout-section-title">Review Order</h2>

                  <div className="checkout-review-section">
                    <p className="checkout-review-section-title">Ship to</p>
                    <p className="checkout-review-section-body">
                      {shipping.fullName}<br/>
                      {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}<br/>
                      {shipping.city}, {shipping.state} {shipping.postalCode}<br/>
                      {shipping.country} · {shipping.phone}
                    </p>
                  </div>

                  <div className="checkout-review-section">
                    <p className="checkout-review-section-title">Payment</p>
                    <p className="checkout-review-section-body">
                      {paymentMethod === 'card'
                        ? `Card ending ${payment.cardNumber.replace(/\s/g, '').slice(-4) || '••••'}`
                        : 'Cash on Delivery'}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.id + item.selectedSize + item.selectedColor} className="checkout-review-item">
                        <div className="checkout-review-item-img">
                          {item.image && <img src={item.image} alt={item.name} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="checkout-review-item-name">{item.name}</p>
                          <p className="checkout-review-item-meta">
                            Qty: {item.quantity}{item.selectedSize ? ` · ${item.selectedSize}` : ''}
                          </p>
                        </div>
                        <span className="checkout-review-item-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {error && <p className="auth-error mt-2">{error}</p>}

                  <div className="flex gap-3">
                    <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(1)} disabled={placing}>
                      <ArrowLeft size={15} /> Back
                    </button>
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
                <div key={i.id + i.selectedSize + i.selectedColor} className="checkout-summary-row">
                  <span className="checkout-summary-item-name">{i.name} ×{i.quantity}</span>
                  <span className="checkout-summary-item-price">${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm" style={{ borderColor: 'var(--border)' }}>
              {[
                ['Subtotal', `$${totals.subtotal.toFixed(2)}`,                                    false],
                ['Shipping', totals.shippingCost === 0 ? 'Free' : `$${totals.shippingCost.toFixed(2)}`, totals.shippingCost === 0],
                ['Tax',      `$${totals.tax.toFixed(2)}`,                                          false],
              ].map(([label, val, isFree]) => (
                <div key={label} className="checkout-summary-row">
                  <span className="checkout-summary-label">{label}</span>
                  <span className={isFree ? 'checkout-summary-value-free' : 'checkout-summary-value'}>{val}</span>
                </div>
              ))}
              <div className="checkout-summary-total-row">
                <span>Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────
function Field({ label, cls, error, children }) {
  return (
    <div>
      <label className={cls} style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
      {error && <p className="checkout-field-error">{error}</p>}
    </div>
  );
}

function AddressFields({ prefix, value, errors, onChange, labelCls, fieldCls }) {
  const fields = [
    { key: 'fullName',   label: 'Full Name',     ph: 'John Doe',         span: 2 },
    { key: 'phone',      label: 'Phone',         ph: '+1 555 123 4567',  span: 1, type: 'tel' },
    { key: 'country',    label: 'Country',       ph: 'United States',    span: 1 },
    { key: 'line1',      label: 'Address Line 1', ph: '123 Main St',     span: 2 },
    { key: 'line2',      label: 'Address Line 2 (optional)', ph: 'Apt 4B', span: 2 },
    { key: 'city',       label: 'City',          ph: 'New York',         span: 1 },
    { key: 'state',      label: 'State / Region', ph: 'NY',              span: 1 },
    { key: 'postalCode', label: 'Postal Code',   ph: '10001',            span: 1 },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(({ key, label, ph, span, type }) => (
        <div key={key} className={span === 2 ? 'col-span-2' : ''}>
          <Field label={label} cls={labelCls} error={errors[`${prefix}.${key}`]}>
            <input
              type={type || 'text'}
              className={fieldCls}
              value={value[key]}
              placeholder={ph}
              onChange={(e) => onChange(key, e.target.value)}
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load secure payment checkout. Check your connection and try again.'));
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [f, setF] = useState({ address: '', city: '', pincode: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const place = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { shipping: f, items: items.map((i) => ({ productId: i._id, qty: i.qty })) };
      if (paymentMethod === 'cod') {
        await api('/orders', { method: 'POST', body: { ...body, paymentMethod: 'cod' } });
        clear();
        nav('/orders');
        return;
      }

      const checkout = await api('/orders/razorpay/order', { method: 'POST', body });
      await loadRazorpay();
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        order_id: checkout.razorpayOrderId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        prefill: checkout.prefill,
        theme: { color: '#176b58' },
        handler: async (response) => {
          try {
            await api('/orders/razorpay/verify', { method: 'POST', body: response });
            clear();
            nav('/orders');
          } catch (err) {
            setError(err.message);
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      razorpay.on('payment.failed', (event) => {
        setError(event.error?.description || 'Payment was not completed. Please try again.');
        setBusy(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (!items.length) return (
    <div className="empty-state">
      <div className="empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Add some products before checking out.</p>
    </div>
  );

  return (
    <>
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Almost yours</p>
          <h1>Checkout</h1>
          <p className="text-muted">A few details and your order is on its way.</p>
        </div>
        <span className="checkout-secure">🔒 Secure checkout</span>
      </div>

      <form id="checkout-form" className="checkout-grid" onSubmit={place}>
        <div>
          <section className="checkout-section">
            <h2><span className="section-icon" aria-hidden="true">01</span> Delivery details</h2>
            <div className="form-grid">
              <div className="input-group full">
                <label className="input-label" htmlFor="checkout-address">Street address</label>
                <input id="checkout-address" className="input-field" required placeholder="123, MG Road, Apartment 4B" value={f.address} onChange={on('address')} autoComplete="street-address" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="checkout-city">City</label>
                <input id="checkout-city" className="input-field" required placeholder="Mumbai" value={f.city} onChange={on('city')} autoComplete="address-level2" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="checkout-pincode">PIN code</label>
                <input id="checkout-pincode" className="input-field" required placeholder="400001" pattern="[0-9]{6}" maxLength={6} value={f.pincode} onChange={on('pincode')} autoComplete="postal-code" />
              </div>
              <div className="input-group full">
                <label className="input-label" htmlFor="checkout-phone">Phone number</label>
                <input id="checkout-phone" className="input-field" required placeholder="9876543210" pattern="[0-9]{10}" maxLength={10} value={f.phone} onChange={on('phone')} autoComplete="tel" />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2><span className="section-icon" aria-hidden="true">02</span> Payment method</h2>
            <div className="payment-options">
              <label className={`payment-option${paymentMethod === 'razorpay' ? ' selected' : ''}`}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                <span className="payment-option-icon">✦</span>
                <span className="payment-option-copy"><strong>Pay online</strong><small>UPI, cards, netbanking & more via Razorpay</small></span>
                <span className="payment-option-mark" aria-hidden="true">✓</span>
              </label>
              <label className={`payment-option${paymentMethod === 'cod' ? ' selected' : ''}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span className="payment-option-icon">₹</span>
                <span className="payment-option-copy"><strong>Cash on delivery</strong><small>Pay when your order reaches your door</small></span>
                <span className="payment-option-mark" aria-hidden="true">✓</span>
              </label>
            </div>
          </section>

          {error && <p className="text-error" role="alert" aria-live="polite" style={{ marginBottom: '1rem' }}>⚠️ {error}</p>}
        </div>

        <aside className="cart-summary" aria-label="Order summary">
          <h3>Order summary</h3>
          <div className="checkout-items">
            {items.map((i) => (
              <div key={i._id} className="summary-row checkout-item">
                <span>{i.name}<span className="text-muted" style={{ marginLeft: '.4rem' }}>×{i.qty}</span></span>
                <strong>{rupees(i.price * i.qty)}</strong>
              </div>
            ))}
          </div>
          <hr className="divider" />
          <div className="summary-row"><span>Subtotal</span><span>{rupees(total)}</span></div>
          <div className="summary-row"><span>Delivery</span><span style={{ color: 'var(--ok)', fontWeight: 600 }}>Free</span></div>
          <div className="summary-row total"><span>Total</span><span>{rupees(total)}</span></div>
          <button id="place-order-btn" type="submit" className="btn" disabled={busy} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {busy ? 'Opening secure checkout…' : paymentMethod === 'cod' ? `Place order · ${rupees(total)}` : `Pay ${rupees(total)}`}
          </button>
          <p className="text-muted text-sm" style={{ textAlign: 'center', marginTop: '.75rem' }}>
            {paymentMethod === 'cod' ? 'Cash on delivery' : '🔒 Payments securely processed by Razorpay'}
          </p>
        </aside>
      </form>
    </>
  );
}

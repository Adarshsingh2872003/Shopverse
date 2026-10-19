import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [f, setF] = useState({ address: '', city: '', pincode: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const place = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/orders', {
        method: 'POST',
        body: { shipping: f, items: items.map((i) => ({ productId: i._id, qty: i.qty })) },
      });
      clear();
      nav('/orders');
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
      <h1 style={{ marginBottom: '1.75rem' }}>Checkout</h1>

      <form id="checkout-form" className="checkout-grid" onSubmit={place} noValidate>
        {/* ── Left: Delivery + Payment ── */}
        <div>
          {/* Delivery section */}
          <div className="checkout-section">
            <h2>
              <span className="section-icon" aria-hidden="true">🚚</span>
              Delivery details
            </h2>
            <div className="form-grid">
              <div className="input-group full">
                <label className="input-label" htmlFor="checkout-address">Street address</label>
                <input
                  id="checkout-address"
                  className="input-field"
                  required
                  placeholder="123, MG Road, Apartment 4B"
                  value={f.address}
                  onChange={on('address')}
                  autoComplete="street-address"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="checkout-city">City</label>
                <input
                  id="checkout-city"
                  className="input-field"
                  required
                  placeholder="Mumbai"
                  value={f.city}
                  onChange={on('city')}
                  autoComplete="address-level2"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="checkout-pincode">PIN code</label>
                <input
                  id="checkout-pincode"
                  className="input-field"
                  required
                  placeholder="400001"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={f.pincode}
                  onChange={on('pincode')}
                  autoComplete="postal-code"
                />
              </div>
              <div className="input-group full">
                <label className="input-label" htmlFor="checkout-phone">Phone number</label>
                <input
                  id="checkout-phone"
                  className="input-field"
                  required
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={f.phone}
                  onChange={on('phone')}
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          {/* Payment section */}
          <div className="checkout-section">
            <h2>
              <span className="section-icon" aria-hidden="true">💵</span>
              Payment method
            </h2>
            <div className="cod-note" role="note">
              <span className="cod-icon" aria-hidden="true">✅</span>
              <span>
                <strong>Cash on Delivery</strong> — Pay when your order arrives at your door. No online payment required.
              </span>
            </div>
          </div>

          {error && (
            <p className="text-error" role="alert" aria-live="polite" style={{ marginBottom: '1rem' }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* ── Right: Order Summary ── */}
        <aside className="cart-summary" aria-label="Order summary">
          <h3>Order Summary</h3>

          {/* Item list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1rem' }}>
            {items.map((i) => (
              <div key={i._id} className="summary-row" style={{ fontSize: '.88rem' }}>
                <span style={{ color: 'var(--ink)' }}>
                  {i.name}
                  <span className="text-muted" style={{ marginLeft: '.4rem' }}>×{i.qty}</span>
                </span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{rupees(i.price * i.qty)}</span>
              </div>
            ))}
          </div>

          <hr className="divider" />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{rupees(total)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span style={{ color: 'var(--ok)', fontWeight: 600 }}>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{rupees(total)}</span>
          </div>

          <button
            id="place-order-btn"
            type="submit"
            className="btn"
            disabled={busy}
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          >
            {busy ? 'Placing order…' : `Place order · ${rupees(total)}`}
          </button>

          <p className="text-muted text-sm" style={{ textAlign: 'center', marginTop: '.75rem' }}>
            🔒 Secured checkout · Cash on delivery
          </p>
        </aside>
      </form>
    </>
  );
}

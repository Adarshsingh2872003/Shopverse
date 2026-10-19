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
    setBusy(true); setError('');
    try {
      await api('/orders', { method: 'POST', body: { shipping: f, items: items.map((i) => ({ productId: i._id, qty: i.qty })) } });
      clear();
      nav('/orders');
    } catch (err) { setError(err.message); setBusy(false); }
  };

  if (!items.length) return <p className="empty">Your cart is empty.</p>;
  return (
    <form className="stack narrow" onSubmit={place}>
      <h1>Delivery details</h1>
      <input required placeholder="Address" value={f.address} onChange={on('address')} />
      <input required placeholder="City" value={f.city} onChange={on('city')} />
      <input required placeholder="PIN code" pattern="[0-9]{6}" value={f.pincode} onChange={on('pincode')} />
      <input required placeholder="Phone" pattern="[0-9]{10}" value={f.phone} onChange={on('phone')} />
      <p className="muted">Payment: cash on delivery. (Add Razorpay or Stripe in <code>routes/orders.js</code>.)</p>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${rupees(total)}`}</button>
    </form>
  );
}

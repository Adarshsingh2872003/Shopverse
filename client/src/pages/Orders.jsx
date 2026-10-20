import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, rupees } from '../api.js';

const STATUS_ICON = {
  placed:     '🕐',
  shipped:    '🚚',
  delivered:  '✅',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => { api('/orders/mine').then(setOrders).catch(() => setOrders([])); }, []);

  if (!orders) return (
    <div className="empty-state" aria-busy="true">
      <div className="empty-icon" style={{ animation: 'shimmer 1.2s infinite' }}>⏳</div>
      <p className="text-muted">Loading your orders…</p>
    </div>
  );

  if (!orders.length) return (
    <div className="empty-state">
      <div className="empty-icon">📦</div>
      <h3>No orders yet</h3>
      <p>When you place an order, it will show up here.</p>
      <Link to="/" className="btn">Start shopping</Link>
    </div>
  );

  return (
    <>
      <h1 style={{ marginBottom: '1.75rem' }}>Your Orders</h1>

      <div className="stack">
        {orders.map((o) => (
          <article key={o._id} className="order-card" aria-label={`Order from ${new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`}>

            {/* ── Header ── */}
            <div className="order-card-head">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                <span className="order-id">Order #{o._id.slice(-8).toUpperCase()}</span>
                <span className="order-date">
                  {new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </span>
              </div>
              <span className={`status-badge ${o.status}`} aria-label={`Status: ${o.status}`}>
                <span aria-hidden="true">{STATUS_ICON[o.status] ?? '📦'}</span>
                {o.status}
              </span>
            </div>

            {/* ── Items ── */}
            <div className="order-items-list">
              {o.items.map((item) => (
                <div key={item._id} className="order-item-row">
                  <span className="order-item-qty">×{item.qty}</span>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span className="text-muted text-sm">{rupees(item.price)}</span>
                </div>
              ))}
            </div>

            {/* ── Footer ── */}
            <div className="order-card-foot">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem' }}>
                <span className="text-muted text-sm">
                  {o.shipping?.city && `📍 ${o.shipping.city}`}
                </span>
                <span className="text-muted text-sm">
                  {o.paymentMethod === 'razorpay'
                    ? (o.paymentStatus === 'paid' ? '✓ Paid online' : '◷ Payment processing')
                    : '₹ Cash on delivery'}
                </span>
              </div>
              <span className="order-total">{rupees(o.total)}</span>
            </div>

          </article>
        ))}
      </div>
    </>
  );
}

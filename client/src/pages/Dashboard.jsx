import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const statusIcon = { placed: '◷', shipped: '↗', delivered: '✓' };

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine').then(setOrders).catch((err) => setError(err.message));
  }, []);

  const spent = orders?.filter((order) => order.paymentMethod === 'cod' || order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.total, 0) ?? 0;
  const active = orders?.filter((order) => order.status !== 'delivered'
    && (order.paymentMethod === 'cod' || order.paymentStatus === 'paid')).length ?? 0;

  return (
    <div className="dashboard-wrap">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Your space</p>
          <h1>Good to see you, {user?.name?.split(' ')[0]}.</h1>
          <p>Everything you love, and every order, all in one place.</p>
        </div>
        <Link className="btn dashboard-shop-btn" to="/">Explore the collection <span aria-hidden="true">→</span></Link>
        <span className="dashboard-hero-orb" aria-hidden="true" />
      </section>

      {error && <p className="text-error" role="alert">Could not load your dashboard: {error}</p>}

      <section className="dashboard-stats" aria-label="Your account summary">
        <article className="dashboard-stat">
          <span className="dashboard-stat-icon">▤</span>
          <span className="dashboard-stat-label">Total orders</span>
          <strong>{orders?.length ?? '—'}</strong>
          <span className="text-muted text-sm">Since you joined</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-icon">↗</span>
          <span className="dashboard-stat-label">On the way</span>
          <strong>{orders ? active : '—'}</strong>
          <span className="text-muted text-sm">Orders in progress</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-icon">₹</span>
          <span className="dashboard-stat-label">Lifetime order value</span>
          <strong>{orders ? rupees(spent) : '—'}</strong>
          <span className="text-muted text-sm">Across your purchases</span>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-head">
          <div><p className="eyebrow">Your purchases</p><h2>Recent orders</h2></div>
          <Link className="link-btn" to="/orders">View all orders →</Link>
        </div>
        {!orders ? (
          <p className="text-muted dashboard-empty">Loading your orders…</p>
        ) : orders.length ? (
          <div className="dashboard-order-list">
            {orders.slice(0, 4).map((order) => (
              <article className="dashboard-order" key={order._id}>
                <span className="dashboard-order-icon">{statusIcon[order.status] ?? '◷'}</span>
                <div className="dashboard-order-info">
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="text-muted text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                </div>
                <span className={`status-badge ${order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' ? 'payment-pending' : order.status}`}>
                  {order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' ? 'payment pending' : order.status}
                </span>
                <strong className="dashboard-order-total">{rupees(order.total)}</strong>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty"><p>Your next favorite thing is waiting.</p><Link to="/" className="btn">Start exploring</Link></div>
        )}
      </section>

      <section className="dashboard-tip">
        <span aria-hidden="true">✦</span>
        <div><strong>Thoughtfully picked for you</strong><p>Explore the latest additions to the ShopVerse collection.</p></div>
        <Link to="/" className="link-btn">Browse products →</Link>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, rupees } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api('/orders/mine').then(setOrders); }, []);
  if (!orders) return null;
  if (!orders.length) return <p className="empty">No orders yet. <Link to="/">Start shopping</Link></p>;

  return (
    <div className="stack">
      <h1>Your orders</h1>
      {orders.map((o) => (
        <div key={o._id} className="order">
          <div className="between">
            <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
            <span className={`status ${o.status}`}>{o.status}</span>
          </div>
          {o.items.map((i) => <p key={i._id}>{i.qty} × {i.name} <span className="muted">{rupees(i.price)}</span></p>)}
          <strong>Total {rupees(o.total)}</strong>
        </div>
      ))}
    </div>
  );
}

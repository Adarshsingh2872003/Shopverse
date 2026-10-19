import { useEffect, useState } from 'react';
import { api, rupees } from '../api.js';

const blank = { name: '', description: '', price: '', category: '', image: '', stock: '' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [f, setF] = useState(blank);
  const [error, setError] = useState('');
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = () => {
    api('/products?limit=100').then((d) => setProducts(d.products));
    api('/orders').then(setOrders);
  };
  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault(); setError('');
    try { await api('/products', { method: 'POST', body: { ...f, price: +f.price, stock: +f.stock } }); setF(blank); load(); }
    catch (err) { setError(err.message); }
  };
  const del = async (id) => { if (confirm('Delete this product?')) { await api(`/products/${id}`, { method: 'DELETE' }); load(); } };
  const setStatus = async (id, status) => { await api(`/orders/${id}/status`, { method: 'PUT', body: { status } }); load(); };

  return (
    <div className="stack">
      <h1>Manage store</h1>

      <form className="admin-form" onSubmit={create}>
        <input required placeholder="Name" value={f.name} onChange={on('name')} />
        <input required placeholder="Category" value={f.category} onChange={on('category')} />
        <input required type="number" min="0" placeholder="Price (₹)" value={f.price} onChange={on('price')} />
        <input required type="number" min="0" placeholder="Stock" value={f.stock} onChange={on('stock')} />
        <input placeholder="Image URL" value={f.image} onChange={on('image')} />
        <input placeholder="Description" value={f.description} onChange={on('description')} />
        <button className="btn">Add product</button>
        {error && <p className="error">{error}</p>}
      </form>

      <h2>Products ({products.length})</h2>
      {products.map((p) => (
        <div key={p._id} className="line">
          <img src={p.image} alt="" />
          <span className="grow">{p.name} <span className="muted">· {p.stock} in stock</span></span>
          <strong>{rupees(p.price)}</strong>
          <button className="link" onClick={() => del(p._id)}>Delete</button>
        </div>
      ))}

      <h2>Orders ({orders.length})</h2>
      {orders.map((o) => (
        <div key={o._id} className="order">
          <div className="between">
            <span>{o.user?.name} <span className="muted">{o.user?.email}</span></span>
            <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)} aria-label="Order status">
              <option value="placed">Placed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option>
            </select>
          </div>
          <p className="muted">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</p>
          <p className="muted">{o.shipping.address}, {o.shipping.city} {o.shipping.pincode} · {o.shipping.phone}</p>
          <strong>{rupees(o.total)}</strong>
        </div>
      ))}
    </div>
  );
}

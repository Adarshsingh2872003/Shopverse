import { useEffect, useState } from 'react';
import { api, rupees } from '../api.js';

const blank = { name: '', description: '', price: '', category: '', image: '', stock: '' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [f, setF]               = useState(blank);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('products'); // 'products' | 'orders'
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = () => {
    api('/products?limit=100').then((d) => setProducts(d.products)).catch(() => {});
    api('/orders').then(setOrders).catch(() => {});
  };
  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/products', { method: 'POST', body: { ...f, price: +f.price, stock: +f.stock } });
      setF(blank);
      load();
    } catch (err) { setError(err.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api(`/products/${id}`, { method: 'DELETE' });
    load();
  };

  const setStatus = async (id, status) => {
    await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
    load();
  };

  return (
    <div className="admin-wrap">
      <h1>Store Manager</h1>

      {/* ── Tab bar ── */}
      <div className="chips-wrap" style={{ marginBottom: '1.75rem' }} role="tablist">
        <button
          id="tab-products"
          role="tab"
          aria-selected={tab === 'products'}
          className={`chip${tab === 'products' ? ' active' : ''}`}
          onClick={() => setTab('products')}
        >
          📦 Products ({products.length})
        </button>
        <button
          id="tab-orders"
          role="tab"
          aria-selected={tab === 'orders'}
          className={`chip${tab === 'orders' ? ' active' : ''}`}
          onClick={() => setTab('orders')}
        >
          🧾 Orders ({orders.length})
        </button>
      </div>

      {/* ══ Products tab ══ */}
      {tab === 'products' && (
        <>
          {/* Add product form */}
          <div className="add-product-form">
            <h2>➕ Add new product</h2>
            <form id="add-product-form" onSubmit={create} noValidate>
              <div className="admin-form-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="p-name">Product name</label>
                  <input id="p-name" className="input-field" required placeholder="Air Max Sneakers" value={f.name} onChange={on('name')} />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="p-category">Category</label>
                  <input id="p-category" className="input-field" required placeholder="Footwear" value={f.category} onChange={on('category')} />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="p-price">Price (₹)</label>
                  <input id="p-price" className="input-field" required type="number" min="0" placeholder="1999" value={f.price} onChange={on('price')} />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="p-stock">Stock qty</label>
                  <input id="p-stock" className="input-field" required type="number" min="0" placeholder="50" value={f.stock} onChange={on('stock')} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" htmlFor="p-image">Image URL</label>
                  <input id="p-image" className="input-field" placeholder="https://…" value={f.image} onChange={on('image')} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" htmlFor="p-desc">Description</label>
                  <input id="p-desc" className="input-field" placeholder="Brief product description…" value={f.description} onChange={on('description')} />
                </div>
              </div>
              {error && <p className="text-error" role="alert" style={{ marginBottom: '.75rem' }}>⚠️ {error}</p>}
              <button id="add-product-btn" type="submit" className="btn">Add product</button>
            </form>
          </div>

          {/* Products table */}
          {products.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table" aria-label="Products list">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        {p.image && (
                          <img
                            src={p.image}
                            alt=""
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--border)' }}
                          />
                        )}
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ fontWeight: 700, color: 'var(--violet)' }}>{rupees(p.price)}</td>
                      <td>
                        <span style={{
                          fontWeight: 600,
                          color: p.stock > 0 ? 'var(--ok)' : 'var(--danger)',
                        }}>
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td>
                        <button
                          id={`delete-${p._id}`}
                          className="btn-danger"
                          onClick={() => del(p._id)}
                          aria-label={`Delete ${p.name}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ Orders tab ══ */}
      {tab === 'orders' && (
        <div className="stack">
          {orders.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <h3>No orders yet</h3>
            </div>
          )}
          {orders.map((o) => (
            <div key={o._id} className="order-card">
              <div className="order-card-head">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {o.user?.name ?? 'Unknown'}
                    <span className="text-muted text-sm" style={{ marginLeft: '.5rem' }}>{o.user?.email}</span>
                  </span>
                  <span className="text-muted text-sm">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    {' · '}📍 {o.shipping?.city}, {o.shipping?.pincode}
                  </span>
                </div>
                <select
                  id={`status-${o._id}`}
                  className="sort-select"
                  value={o.status}
                  onChange={(e) => setStatus(o._id, e.target.value)}
                  aria-label={`Update status for order #${o._id.slice(-8)}`}
                >
                  <option value="pending">🕐 Pending</option>
                  <option value="processing">⚙️ Processing</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">✅ Delivered</option>
                </select>
              </div>
              <div className="order-items-list">
                {o.items.map((i) => (
                  <div key={i._id} className="order-item-row">
                    <span className="order-item-qty">×{i.qty}</span>
                    <span style={{ flex: 1 }}>{i.name}</span>
                    <span className="text-muted text-sm">{rupees(i.price)}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-foot">
                <span className="text-muted text-sm">📞 {o.shipping?.phone}</span>
                <span className="order-total">{rupees(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

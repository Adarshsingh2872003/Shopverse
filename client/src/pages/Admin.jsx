import { useEffect, useState } from 'react';
import { api, rupees } from '../api.js';

const blank = { name: '', description: '', price: '', category: '', image: '', stock: '' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [f, setF]               = useState(blank);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('products'); // 'products' | 'orders'
  const [productTotal, setProductTotal] = useState(0);
  const [loadingError, setLoadingError] = useState('');
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = async () => {
    setLoadingError('');
    try {
      const [productData, orderData] = await Promise.all([api('/products?limit=100'), api('/orders')]);
      setProducts(productData.products);
      setProductTotal(productData.total);
      setOrders(orderData);
    } catch (err) {
      setLoadingError(err.message);
    }
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
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      load();
    } catch (err) { setError(err.message); }
  };

  const setStatus = async (id, status) => {
    try {
      await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
      load();
    } catch (err) { setLoadingError(err.message); }
  };

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const awaiting = orders.filter((order) => order.status === 'placed'
    && (order.paymentMethod === 'cod' || order.paymentStatus === 'paid')).length;

  return (
    <div className="admin-wrap">
      <div className="dashboard-heading">
        <div><p className="eyebrow">Store overview</p><h1>Admin dashboard</h1><p className="text-muted">A clear view of your store, all in one place.</p></div>
        <span className="admin-live"><span /> Store live</span>
      </div>

      {loadingError && <p className="text-error" role="alert" style={{ marginBottom: '1rem' }}>Could not load store data: {loadingError}</p>}

      <section className="dashboard-stats admin-stats" aria-label="Store summary">
        <article className="dashboard-stat"><span className="dashboard-stat-icon">▦</span><span className="dashboard-stat-label">Products</span><strong>{productTotal}</strong><span className="text-muted text-sm">Listed in your store</span></article>
        <article className="dashboard-stat"><span className="dashboard-stat-icon">▤</span><span className="dashboard-stat-label">Total orders</span><strong>{orders.length}</strong><span className="text-muted text-sm">All customer orders</span></article>
        <article className="dashboard-stat"><span className="dashboard-stat-icon">₹</span><span className="dashboard-stat-label">Order value</span><strong>{rupees(revenue)}</strong><span className="text-muted text-sm">Across all orders</span></article>
        <article className="dashboard-stat"><span className="dashboard-stat-icon">◷</span><span className="dashboard-stat-label">To fulfill</span><strong>{awaiting}</strong><span className="text-muted text-sm">Placed, awaiting shipment</span></article>
      </section>

      {/* ── Tab bar ── */}
      <div className="dashboard-tabs" style={{ marginBottom: '1.5rem' }} role="tablist" aria-label="Store management">
        <button
          id="tab-products"
          role="tab"
          aria-selected={tab === 'products'}
          className={`chip${tab === 'products' ? ' active' : ''}`}
          onClick={() => setTab('products')}
        >
          Products <span>{productTotal}</span>
        </button>
        <button
          id="tab-orders"
          role="tab"
          aria-selected={tab === 'orders'}
          className={`chip${tab === 'orders' ? ' active' : ''}`}
          onClick={() => setTab('orders')}
        >
          Orders <span>{orders.length}</span>
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
                  disabled={o.paymentMethod === 'razorpay' && o.paymentStatus !== 'paid'}
                  aria-label={`Update status for order #${o._id.slice(-8)}`}
                >
                  <option value="placed">◷ Placed</option>
                  <option value="shipped">↗ Shipped</option>
                  <option value="delivered">✓ Delivered</option>
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
                <span className="order-total">{rupees(o.total)} · {o.paymentMethod === 'razorpay' ? (o.paymentStatus === 'paid' ? 'Paid online' : 'Payment pending') : 'Cash on delivery'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

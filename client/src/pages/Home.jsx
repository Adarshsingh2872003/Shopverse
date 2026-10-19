import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Home() {
  const { add } = useCart();
  const [q, setQ] = useState({ search: '', category: 'all', sort: 'newest', page: 1 });
  const [data, setData] = useState({ products: [], categories: [], pages: 1 });
  const [loading, setLoading] = useState(true);
  const set = (patch) => setQ((cur) => ({ ...cur, page: 1, ...patch }));

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api('/products?' + new URLSearchParams(q))
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const quickAdd = (e, p) => {
    e.preventDefault();
    e.stopPropagation();
    add(p, 1);
    // brief visual feedback on the button
    const btn = e.currentTarget;
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '+'; }, 900);
  };

  const first = loading && data.products.length === 0;

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" aria-label="Hero section">
        <div className="hero-content">
          <p className="hero-eyebrow">Cash on delivery · Secure checkout</p>
          <h1 className="hero-headline">
            Discover Premium<br />Products.
          </h1>
          <p className="hero-sub">
            Clothing, footwear, electronics and home essentials — all in one place, delivered to your door.
          </p>

          <div className="hero-search-wrap">
            <span className="hero-search-icon" aria-hidden="true">🔍</span>
            <input
              id="hero-search"
              className="hero-search"
              type="search"
              placeholder="Search products…"
              value={q.search}
              onChange={(e) => set({ search: e.target.value })}
              aria-label="Search products"
              autoComplete="off"
            />
          </div>

          <div className="hero-badges" aria-label="Trust signals">
            <span className="trust-badge"><span className="dot" aria-hidden="true" />Free returns</span>
            <span className="trust-badge"><span className="dot" aria-hidden="true" />Secure payments</span>
            <span className="trust-badge"><span className="dot" aria-hidden="true" />Fast delivery</span>
          </div>
        </div>

        {/* Floating stats — hidden on mobile via CSS */}
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-stat-card">
            <div className="stat-num">10K+</div>
            <div className="stat-label">Happy customers</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-num">500+</div>
            <div className="stat-label">Premium products</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-num">4.9★</div>
            <div className="stat-label">Average rating</div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="filters-row">
        <h2>
          {q.category === 'all' ? 'All Products' : q.category}
          {!loading && (
            <span className="text-muted text-sm" style={{ fontWeight: 400, marginLeft: '.6rem' }}>
              ({data.products.length} items)
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
          <div className="chips-wrap" role="group" aria-label="Filter by category">
            {['all', ...data.categories].map((c) => (
              <button
                key={c}
                id={`cat-${c}`}
                className={`chip${q.category === c ? ' active' : ''}`}
                onClick={() => set({ category: c })}
                aria-pressed={q.category === c}
              >
                {c === 'all' ? '✦ All' : c}
              </button>
            ))}
          </div>
          <select
            id="sort-select"
            className="sort-select"
            value={q.sort}
            onChange={(e) => set({ sort: e.target.value })}
            aria-label="Sort products"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low → high</option>
            <option value="price_desc">Price: high → low</option>
          </select>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!loading && data.products.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try a different search term or category.</p>
          <button className="btn" onClick={() => setQ({ search: '', category: 'all', sort: 'newest', page: 1 })}>
            Clear filters
          </button>
        </div>
      )}

      {/* ── Product Grid ── */}
      <div
        className={`product-grid${loading && !first ? ' loading' : ''}`}
        aria-live="polite"
        aria-busy={loading}
      >
        {/* Skeleton cards */}
        {first && Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="product-card skeleton" aria-hidden="true">
            <div className="skel-img" />
            <div className="skel-body">
              <div className="skel-line short" />
              <div className="skel-line med" />
              <div className="skel-line short" />
            </div>
          </div>
        ))}

        {/* Real product cards */}
        {data.products.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            className="product-card"
            aria-label={`${p.name}, ${rupees(p.price)}`}
          >
            <div className="product-card-img">
              <img src={p.image} alt={p.name} loading="lazy" />
              {p.stock === 0 && <span className="sold-out-badge">Sold out</span>}
            </div>
            <div className="product-card-body">
              <span className="product-cat">{p.category}</span>
              <span className="product-name">{p.name}</span>
              <div className="product-footer">
                <span className="product-price">{rupees(p.price)}</span>
                {p.stock > 0 && (
                  <button
                    id={`add-${p._id}`}
                    className="quick-add"
                    onClick={(e) => quickAdd(e, p)}
                    aria-label={`Add ${p.name} to cart`}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Pagination ── */}
      {data.pages > 1 && (
        <div className="pager" aria-label="Pagination">
          <button
            id="pager-prev"
            className="pager-btn"
            disabled={q.page === 1}
            onClick={() => setQ({ ...q, page: q.page - 1 })}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span className="pager-info">Page {q.page} of {data.pages}</span>
          <button
            id="pager-next"
            className="pager-btn"
            disabled={q.page === data.pages}
            onClick={() => setQ({ ...q, page: q.page + 1 })}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

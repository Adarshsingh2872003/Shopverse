import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, rupees } from '../api.js';

export default function Home() {
  const [q, setQ] = useState({ search: '', category: 'all', sort: 'newest', page: 1 });
  const [data, setData] = useState({ products: [], categories: [], pages: 1 });
  const [loading, setLoading] = useState(true);
  const set = (patch) => setQ((cur) => ({ ...cur, page: 1, ...patch }));

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api('/products?' + new URLSearchParams(q)).then(setData).finally(() => setLoading(false));
    }, 250); // debounce typing
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <section className="hero">
        <h1>Good things, delivered to your door.</h1>
        <input className="search" placeholder="Search products" value={q.search}
          onChange={(e) => set({ search: e.target.value })} aria-label="Search products" />
      </section>

      <div className="filters">
        <div className="chips">
          {['all', ...data.categories].map((c) => (
            <button key={c} className={q.category === c ? 'chip on' : 'chip'} onClick={() => set({ category: c })}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
        <select value={q.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {!loading && data.products.length === 0 && <p className="empty">No products match. Try a different search or category.</p>}
      <div className="grid" style={{ opacity: loading ? 0.5 : 1 }}>
        {data.products.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`} className="card">
            <img src={p.image} alt={p.name} loading="lazy" />
            <div className="card-body">
              <span>{p.name}</span>
              <strong>{rupees(p.price)}</strong>
            </div>
            {p.stock === 0 && <em className="sold">Sold out</em>}
          </Link>
        ))}
      </div>

      {data.pages > 1 && (
        <div className="pager">
          <button disabled={q.page === 1} onClick={() => setQ({ ...q, page: q.page - 1 })}>Previous</button>
          <span>Page {q.page} of {data.pages}</span>
          <button disabled={q.page === data.pages} onClick={() => setQ({ ...q, page: q.page + 1 })}>Next</button>
        </div>
      )}
    </>
  );
}

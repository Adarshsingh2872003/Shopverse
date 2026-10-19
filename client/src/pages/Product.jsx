import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Product() {
  const { id } = useParams();
  const { add } = useCart();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/products/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error) return (
    <div className="empty-state">
      <div className="empty-icon">😕</div>
      <h3>Product not found</h3>
      <p>{error}</p>
      <Link to="/" className="btn">Back to shop</Link>
    </div>
  );
  if (!p) return null;

  const handleAdd = () => {
    add(p, qty);
    setAdded(true);
  };
  const handleBuyNow = () => {
    add(p, qty);
    nav('/cart');
  };
  const changeQty = (delta) => setQty((q) => Math.max(1, Math.min(q + delta, p.stock)));

  return (
    <>
      <Link to="/" className="breadcrumb" aria-label="Back to all products">
        <span className="arrow">←</span>
        Back to shop
      </Link>

      <div className="detail-grid">
        {/* ── Image ── */}
        <div className="detail-img-wrap">
          <img src={p.image} alt={p.name} />
        </div>

        {/* ── Info ── */}
        <div className="detail-info">
          <p className="product-cat">{p.category}</p>
          <h1>{p.name}</h1>
          <p className="detail-price">{rupees(p.price)}</p>
          <p className="detail-desc">{p.description}</p>

          {/* Stock indicator */}
          {p.stock > 0 ? (
            <span className="stock-indicator in">
              <span className="dot" aria-hidden="true" />
              {p.stock} in stock
            </span>
          ) : (
            <span className="stock-indicator out">
              <span className="dot" aria-hidden="true" />
              Out of stock
            </span>
          )}

          {/* Quantity + Actions */}
          {p.stock > 0 && (
            <>
              <div className="qty-row">
                <div className="qty-stepper" role="group" aria-label="Quantity">
                  <button
                    id="qty-minus"
                    onClick={() => changeQty(-1)}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span aria-live="polite" aria-atomic="true">{qty}</span>
                  <button
                    id="qty-plus"
                    onClick={() => changeQty(1)}
                    disabled={qty >= p.stock}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <button id="add-to-cart-btn" className="btn" onClick={handleAdd}>
                  🛒 Add to cart
                </button>
                <button id="buy-now-btn" className="btn btn-ghost" onClick={handleBuyNow}>
                  Buy now →
                </button>
              </div>

              {added && (
                <div className="added-notice" role="status" aria-live="polite">
                  ✅ Added to your cart!{' '}
                  <Link to="/cart" className="link-btn" style={{ marginLeft: '.25rem' }}>
                    View cart →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

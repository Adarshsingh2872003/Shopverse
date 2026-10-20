import { Link, useNavigate } from 'react-router-dom';
import { rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const nav = useNavigate();

  if (!items.length) return (
    <div className="empty-state">
      <div className="empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Looks like you haven't added anything yet.</p>
      <Link to="/" className="btn">Start shopping</Link>
    </div>
  );

  return (
    <>
      <h1 className="cart-title">Your Cart</h1>

      <div className="cart-layout">
        {/* ── Items list ── */}
        <div>
          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <img
                  className="cart-item-img"
                  src={item.image}
                  alt={item.name}
                />
                <div className="cart-item-info">
                  <Link to={`/product/${item._id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <span className="cart-item-price">{rupees(item.price)} each</span>
                </div>

                <div className="cart-item-controls">
                  {/* Inline qty stepper */}
                  <div className="qty-stepper" role="group" aria-label={`Quantity of ${item.name}`}>
                    <button
                      id={`qty-minus-${item._id}`}
                      onClick={() => setQty(item._id, Math.max(1, item.qty - 1))}
                      disabled={item.qty <= 1}
                      aria-label="Decrease"
                    >−</button>
                    <span aria-live="polite">{item.qty}</span>
                    <button
                      id={`qty-plus-${item._id}`}
                      onClick={() => setQty(item._id, Math.min(item.stock, item.qty + 1))}
                      disabled={item.qty >= item.stock}
                      aria-label="Increase"
                    >+</button>
                  </div>

                  <span className="cart-item-subtotal">{rupees(item.price * item.qty)}</span>

                  <button
                    id={`remove-${item._id}`}
                    className="btn-danger"
                    onClick={() => remove(item._id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Order summary sidebar ── */}
        <aside className="cart-summary" aria-label="Order summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>{rupees(total)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span style={{ color: 'var(--ok)', fontWeight: 600 }}>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{rupees(total)}</span>
          </div>

          <div className="trust-row" aria-label="Trust features">
            <div className="trust-item">🚚 Free delivery on all orders</div>
            <div className="trust-item">💳 Pay online or cash on delivery</div>
            <div className="trust-item">🔒 Secure checkout</div>
            <div className="trust-item">↩️ Easy 30-day returns</div>
          </div>

          <button
            id="checkout-btn"
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => nav('/checkout')}
          >
            Continue to checkout →
          </button>
        </aside>
      </div>
    </>
  );
}

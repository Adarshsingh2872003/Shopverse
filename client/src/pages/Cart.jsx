import { Link, useNavigate } from 'react-router-dom';
import { rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const nav = useNavigate();
  if (!items.length) return <p className="empty">Your cart is empty. <Link to="/">Find something to add</Link></p>;

  return (
    <div className="stack">
      <h1>Your cart</h1>
      {items.map((i) => (
        <div key={i._id} className="line">
          <img src={i.image} alt="" />
          <div className="grow"><Link to={`/product/${i._id}`}>{i.name}</Link><br /><span className="muted">{rupees(i.price)}</span></div>
          <input type="number" min="1" max={i.stock} value={i.qty} aria-label={`Quantity of ${i.name}`}
            onChange={(e) => setQty(i._id, +e.target.value || 1)} />
          <strong>{rupees(i.price * i.qty)}</strong>
          <button className="link" onClick={() => remove(i._id)}>Remove</button>
        </div>
      ))}
      <div className="total"><span>Total</span><strong>{rupees(total)}</strong></div>
      <button className="btn" onClick={() => nav('/checkout')}>Continue to checkout</button>
    </div>
  );
}

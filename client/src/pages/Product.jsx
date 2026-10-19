import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, rupees } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Product() {
  const { id } = useParams();
  const { add } = useCart();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => { api(`/products/${id}`).then(setP).catch((e) => setError(e.message)); }, [id]);
  if (error) return <p className="empty">{error}</p>;
  if (!p) return null;

  return (
    <div className="detail">
      <img src={p.image} alt={p.name} />
      <div>
        <p className="muted">{p.category}</p>
        <h1>{p.name}</h1>
        <p className="price">{rupees(p.price)}</p>
        <p>{p.description}</p>
        <p className="muted">{p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}</p>
        {p.stock > 0 && (
          <div className="row">
            <input type="number" min="1" max={p.stock} value={qty} aria-label="Quantity"
              onChange={(e) => setQty(Math.max(1, Math.min(+e.target.value || 1, p.stock)))} />
            <button className="btn" onClick={() => add(p, qty)}>Add to cart</button>
            <button className="btn ghost" onClick={() => { add(p, qty); nav('/cart'); }}>Buy now</button>
          </div>
        )}
      </div>
    </div>
  );
}

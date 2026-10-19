import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const readGuest = () => JSON.parse(localStorage.getItem('cart') || '[]');
const toBody = (items) => ({ items: items.map((i) => ({ productId: i._id, qty: i.qty })) });

// Guests: cart lives in localStorage. Signed-in users: cart lives in MongoDB.
export function CartProvider({ children }) {
  const { user, ready } = useAuth();
  const [items, setItems] = useState(readGuest);
  const synced = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      if (synced.current) setItems([]); // just signed out: don't leak the cart to the next visitor
      synced.current = false;
      return;
    }
    (async () => {
      const server = await api('/cart');
      const guest = readGuest();
      const merged = new Map(server.map((i) => [i._id, i]));
      for (const g of guest) {
        const s = merged.get(g._id);
        merged.set(g._id, s ? { ...s, qty: Math.min(s.qty + g.qty, s.stock) } : g);
      }
      const list = [...merged.values()];
      setItems(list);
      if (guest.length) {
        localStorage.removeItem('cart');
        setItems(await api('/cart', { method: 'PUT', body: toBody(list) }));
      }
    })().catch(() => {}).finally(() => { synced.current = true; });
  }, [user, ready]);

  const save = (next) => {
    setItems(next);
    if (user) api('/cart', { method: 'PUT', body: toBody(next) }).catch(() => {});
    else localStorage.setItem('cart', JSON.stringify(next));
  };

  const add = (p, qty = 1) => {
    const found = items.find((i) => i._id === p._id);
    save(found
      ? items.map((i) => i._id === p._id ? { ...i, qty: Math.min(i.qty + qty, p.stock) } : i)
      : [...items, { _id: p._id, name: p.name, price: p.price, image: p.image, stock: p.stock, qty }]);
  };
  const setQty = (id, qty) => save(items.map((i) => i._id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i));
  const remove = (id) => save(items.filter((i) => i._id !== id));
  const clear = () => save([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}

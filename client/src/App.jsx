import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useCart } from './context/CartContext.jsx';
import Home from './pages/Home.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';

function Guard({ admin, children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <>
      <header className="bar">
        <Link to="/" className="logo">Shopverse</Link>
        <nav>
          <NavLink to="/cart">Cart{count > 0 && <b className="badge">{count}</b>}</NavLink>
          {user && <NavLink to="/orders">Orders</NavLink>}
          {user?.isAdmin && <NavLink to="/admin">Manage</NavLink>}
          {user
            ? <button className="link" onClick={() => { logout(); nav('/'); }}>Sign out ({user.name.split(' ')[0]})</button>
            : <NavLink to="/login">Sign in</NavLink>}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Guard><Checkout /></Guard>} />
          <Route path="/orders" element={<Guard><Orders /></Guard>} />
          <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
          <Route path="*" element={<p className="empty">Page not found. <Link to="/">Back to the shop</Link></p>} />
        </Routes>
      </main>
    </>
  );
}

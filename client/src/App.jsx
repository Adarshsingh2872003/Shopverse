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
      {/* ── Navbar ── */}
      <header className="navbar">
        <Link to="/" className="navbar-logo" aria-label="ShopVerse home">
          <div className="logo-icon" aria-hidden="true">⚡</div>
          <span className="logo-text">ShopVerse</span>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="navbar-nav">
            {user && (
              <li>
                <NavLink
                  to="/orders"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span aria-hidden="true">📦</span>
                  <span>Orders</span>
                </NavLink>
              </li>
            )}
            {user?.isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span aria-hidden="true">⚙️</span>
                  <span>Manage</span>
                </NavLink>
              </li>
            )}
            {user ? (
              <li>
                <button
                  className="sign-out-btn"
                  onClick={() => { logout(); nav('/'); }}
                  aria-label={`Sign out of ${user.name.split(' ')[0]}'s account`}
                >
                  <span aria-hidden="true">👤</span>
                  {user.name.split(' ')[0]}
                  <span style={{ opacity: .5 }}>·</span>
                  Sign out
                </button>
              </li>
            ) : (
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span aria-hidden="true">👤</span>
                  <span>Sign in</span>
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/cart" className="cart-btn" aria-label={`Cart, ${count} item${count !== 1 ? 's' : ''}`}>
                🛒
                {count > 0 && (
                  <span className="cart-badge" aria-live="polite">{count}</span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      {/* ── Page Content ── */}
      <main className="page-wrap">
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart"    element={<Cart />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/checkout" element={<Guard><Checkout /></Guard>} />
          <Route path="/orders"  element={<Guard><Orders /></Guard>} />
          <Route path="/admin"   element={<Guard admin><Admin /></Guard>} />
          <Route path="*"        element={
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <h3>Page not found</h3>
              <p>This page doesn't exist or was moved.</p>
              <Link to="/" className="btn">Back to the shop</Link>
            </div>
          } />
        </Routes>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-copy">© 2026 ShopVerse · Built with the MERN stack</span>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

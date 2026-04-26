import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { api, setAccessToken, onAuthExpired } from './lib/api';
import useStore from './store/useStore';

const STORE_KEY = 'luxe-store';

function RequireAuth({ children }) {
  const user     = useStore((s) => s.user);
  const location = useLocation();
  // Preserve the path the user was trying to reach so we can bounce them back after login.
  if (!user) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return children;
}

// Sits inside BrowserRouter so it can use useNavigate. Wires:
//  - auth-expired event from api.js → clear session + redirect to /login
//  - cross-tab logout/login → mirror state via Zustand persist rehydrate
function AppShell() {
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthExpired(() => {
      // Refresh failed — session is unrecoverable. Clear local user, keep cart/wishlist for re-login UX.
      useStore.getState().clearSession();
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORE_KEY) return;
      // Another tab updated our persisted store (login/logout/cart change). Pull the latest snapshot.
      try { useStore.persist.rehydrate(); } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <Toast />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />

          {/* Protected routes */}
          <Route path="/"            element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/shop"        element={<RequireAuth><Shop /></RequireAuth>} />
          <Route path="/product/:id" element={<RequireAuth><ProductDetails /></RequireAuth>} />
          <Route path="/cart"        element={<RequireAuth><Cart /></RequireAuth>} />
          <Route path="/checkout"    element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/orders"      element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/orders/:id"  element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="/profile"     element={<RequireAuth><Profile /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    api.post('/auth/refresh')
      .then((data) => { if (data?.token) setAccessToken(data.token); })
      .catch(() => {})
      .finally(() => setAuthReady(true));
  }, []);

  if (!authReady) return null;

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

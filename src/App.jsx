import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { api, setAccessToken } from './lib/api';
import useStore from './store/useStore';

function RequireAuth({ children }) {
  const user = useStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
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
          <Route path="/"        element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/shop"    element={<RequireAuth><Shop /></RequireAuth>} />
          <Route path="/product/:id" element={<RequireAuth><ProductDetails /></RequireAuth>} />
          <Route path="/cart"    element={<RequireAuth><Cart /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/orders"  element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

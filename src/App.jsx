import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  useEffect(() => {
    api.post('/auth/refresh')
      .then((data) => { if (data?.token) setAccessToken(data.token); })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <CartDrawer />
      <Toast />
      <main>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/shop"            element={<Shop />} />
          <Route path="/product/:id"     element={<ProductDetails />} />
          <Route path="/cart"            element={<Cart />} />
          <Route path="/checkout"        element={<Checkout />} />
          <Route path="/orders"          element={<Orders />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

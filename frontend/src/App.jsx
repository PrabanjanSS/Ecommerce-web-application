import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Orders from './pages/Orders';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cartItems')) || []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cart));
  }, [cart]);

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    setUser(null);
    setCart([]);
  };

  return (
    <BrowserRouter>
      {/* Cohesive Navbar Container Injection */}
      <Navbar user={user} logout={logout} cartCount={cart.reduce((a, c) => a + c.quantity, 0)} />
      
      {/* Premium Presentation Frame Geometry Wrapper */}
      <div className="max-w-7xl mx-auto px-6 py-8 animate-fadeIn">
        <Routes>
          <Route path="/" element={<Home cart={cart} setCart={setCart} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/admin-secure-register-portal" element={<AdminRegister setUser={setUser} />} />
          
          <Route path="/cart" element={
            <ProtectedRoute user={user} allowedRole="customer">
              <Cart cart={cart} setCart={setCart} user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute user={user} allowedRole="customer">
              <Orders user={user} />
            </ProtectedRoute>
          } />

          <Route path="/admin-dashboard" element={
            <ProtectedRoute user={user} allowedRole="admin">
              <AdminDashboard user={user} />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
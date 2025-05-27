import React from 'react';
import { BrowserRouter as Router, Routes, Route ,Outlet,Navigate} from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import CustomerDashboard from './pages/CustomerDashboard'
import SellerDashboard from './pages/SellerDashboard';
import SignUp from './pages/Signup';
import ManageProduct from './pages/ManageProduct'
import Profile from './pages/Profile'
import ProductDetailPage from './pages/ProductDetailPage';
import Cart from './pages/Cart';
import PayMoney from './pages/pay_money';
import OrderStatus from './pages/order_status';
import SearchResultsPage from './pages/SearchResultPage';
import OrderCustomerPage from './pages/order_customer';
const SellerRole = () => {
  const isAuthenticated = localStorage.getItem('token');
  const usertype = JSON.parse(localStorage.getItem('userData')).user_type;
  if (isAuthenticated && (usertype=='customer')) {
    return <Navigate to="/customerdashboard" />;
  }
  else if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
};
const CustomerRole = () => {
  const isAuthenticated = localStorage.getItem('token');
  const usertype = JSON.parse(localStorage.getItem('userData')).user_type;
  if (isAuthenticated && (usertype=='seller')) {
    return <Navigate to="/sellerdashboard" />;
  }
  else if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/paymoney" element={<PayMoney />} />
        <Route path="/orderstatus" element={<OrderStatus />} />
        {/* Private Routes */}
        <Route element={<SellerRole />}>
          <Route path="/sellerdashboard" element={<SellerDashboard />} />
          <Route path="/manageproduct" element={<ManageProduct />} />
        </Route>
        <Route element={<CustomerRole />}>
          <Route path="/customerdashboard" element={<CustomerDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/orders" element={<OrderCustomerPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

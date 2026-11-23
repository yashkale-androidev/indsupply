import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireAuth } from './components/Guards.jsx';
import { Button, EmptyState } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import Categories from './pages/Categories.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Profile from './pages/Profile.jsx';
import Auth from './pages/Auth.jsx';
import Contact from './pages/Contact.jsx';
import Info from './pages/Info.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCustomers from './pages/admin/AdminCustomers.jsx';

const NotFound = () => (
  <EmptyState art="box" title="Page not found" text="The page you are looking for does not exist or has moved." action={<Button as={Link} to="/">Go to home</Button>} />
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<ProductList />} />
        <Route path="category/:slug" element={<ProductList />} />
        <Route path="search" element={<ProductList />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="login" element={<Auth />} />
        <Route path="contact" element={<Contact />} />
        <Route path="info/:slug" element={<Info />} />
        <Route path="admin/login" element={<Auth admin />} />
        <Route path="cart" element={<Cart />} />
        <Route element={<RequireAuth />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="account/orders" element={<Orders />} />
          <Route path="account/orders/:id" element={<OrderDetail />} />
          <Route path="account/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<RequireAuth role="ADMIN" />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>
      </Route>
    </Routes>
  );
}

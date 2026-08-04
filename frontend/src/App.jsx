import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/ui/PrivateRoute';
import AdminRoute from './components/ui/AdminRoute';
import Loader from './components/ui/Loader';

// Route-level code splitting: the shell + home ship first, everything
// else (checkout, admin) loads on demand.
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/auth/ProfilePage'));
const ShippingPage = lazy(() => import('./pages/checkout/ShippingPage'));
const PaymentPage = lazy(() => import('./pages/checkout/PaymentPage'));
const PlaceOrderPage = lazy(() => import('./pages/checkout/PlaceOrderPage'));
const OrderPage = lazy(() => import('./pages/order/OrderPage'));
const ProductListPage = lazy(() => import('./pages/admin/ProductListPage'));
const ProductEditPage = lazy(() => import('./pages/admin/ProductEditPage'));
const UserListPage = lazy(() => import('./pages/admin/UserListPage'));
const UserEditPage = lazy(() => import('./pages/admin/UserEditPage'));
const OrderListPage = lazy(() => import('./pages/admin/OrderListPage'));

const App = () => (
  <div className="flex min-h-[100dvh] flex-col">
    <Header />
    <main className="flex-1">
      <Suspense fallback={<Loader label="Loading…" className="py-24" />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/page/:pageNumber" element={<HomePage />} />
          <Route path="/search/:keyword" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Guest */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/placeorder" element={<PlaceOrderPage />} />
            <Route path="/order/:id" element={<OrderPage />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/products" element={<ProductListPage />} />
            <Route path="/admin/product/:id/edit" element={<ProductEditPage />} />
            <Route path="/admin/product/new" element={<ProductEditPage />} />
            <Route path="/admin/users" element={<UserListPage />} />
            <Route path="/admin/user/:id/edit" element={<UserEditPage />} />
            <Route path="/admin/orders" element={<OrderListPage />} />
            <Route path="/admin/order/:id" element={<OrderPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
    <Footer />
  </div>
);

export default App;

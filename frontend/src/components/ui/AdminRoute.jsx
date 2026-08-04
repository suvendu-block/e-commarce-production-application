import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Admin guard — non-admins are sent home
const AdminRoute = () => {
  const { user, token } = useSelector((state) => state.auth);

  if (!user || !token) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth guard — redirects guests to /login, remembering where they came from
const PrivateRoute = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;

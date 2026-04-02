import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, resellerOnly = false }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (resellerOnly && user?.role !== 'reseller') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

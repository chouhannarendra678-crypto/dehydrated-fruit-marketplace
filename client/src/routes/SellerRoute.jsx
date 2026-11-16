import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../redux/slices/authSlice';
import { ROLES } from '../constants/roles';

const SellerRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow SELLER (and ADMIN for preview/supervision)
  if (user?.role !== ROLES.SELLER && user?.role !== ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SellerRoute;


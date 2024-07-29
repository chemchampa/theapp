import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import api from '../utils/api';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/check');
        setIsAuth(response.data.isAuthenticated);
        setIsAdmin(response.data.user?.role === 'admin');
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth check failed', error);
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [setUser]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  if (!isAuth || (adminOnly && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

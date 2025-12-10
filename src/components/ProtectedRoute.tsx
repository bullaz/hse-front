import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, initializeAuth } = useAuth();
  const [isLoading, setLoading] = React.useState(true);
  const location = useLocation();

  // const delay = (ms: number) => {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  useEffect(() => {
    const initialize = async () => {
      await initializeAuth();
      //await delay(500);
      setLoading(false);
    }
    initialize();
    return () => {
      setLoading(true);
    }
  }, [initializeAuth]);


  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  } else {
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;
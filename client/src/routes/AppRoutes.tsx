import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routesConfig } from './routes.config';
import PageLoader from '../components/common/PageLoader';

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  // Show ZYLO mascot page loader while initial session check is resolving
  if (isLoading) {
    return (
      <PageLoader
        variant="mascot"
        size="md"
        text="Loading ZYLO..."
        fullScreen={true}
      />
    );
  }

  return (
    <Routes>
      {routesConfig.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default AppRoutes;

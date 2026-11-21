import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBilling } from '../context/BillingContext';
import { USE_API } from '../config/dataSource';
import type { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const billing = useBilling();
  const location = useLocation();

  // With the API, screens initialise their forms from billing data, so wait until it has loaded.
  if (isLoading || (USE_API && isAuthenticated && billing.isLoading)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (USE_API && isAuthenticated && billing.error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-[#C0392B]" role="alert">
          {billing.error}
        </p>
        <button
          type="button"
          className="rounded-xl bg-[#2563EB] px-4 py-2 font-semibold text-white"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Redirect to the dashboard corresponding to the user's actual role
    const redirectPath = role === 'vendor' ? '/vendor' : '/customer';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

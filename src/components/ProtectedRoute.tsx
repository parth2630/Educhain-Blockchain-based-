import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const { address } = useWallet();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);

  if (!isAuthenticated || !user) {
    if (!showWarning) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center">
              <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Access Denied
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please log in to access this page
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (!showWarning) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center">
              <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Access Denied
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You don't have permission to access this page
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!address) {
    if (!showWarning) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center">
              <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Wallet Required
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please connect your wallet to access this page
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 
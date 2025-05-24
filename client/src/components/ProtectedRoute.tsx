import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import Login from "@/pages/login";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      user.permissions.includes(permission) || user.permissions.includes("all")
    );

    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.098 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <p className="text-sm text-gray-500">
              Role Anda: <span className="font-medium">{user.role}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
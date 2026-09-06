// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Chargement de la session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page, saving the original location for post-login redirection
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // User is authenticated but doesn't have the required role
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-full mx-auto mb-6 text-2xl font-bold">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h1>
          <p className="text-gray-500 mb-6">
            Votre profil actuel (rôle: <span className="font-semibold text-sky-600 uppercase">{role}</span>) ne possède pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
}

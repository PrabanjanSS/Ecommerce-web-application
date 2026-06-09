import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, allowedRole, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}
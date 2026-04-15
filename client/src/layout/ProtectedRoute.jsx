import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" replace />;

  // ✅ prevent admin token from opening user area
  const roles = user.roles || [];
  if (roles.includes("ADMIN")) return <Navigate to="/admin/dashboard" replace />;

  return children;
}

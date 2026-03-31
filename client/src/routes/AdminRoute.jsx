import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";


const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();

  // not logged in → go login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // logged in but not admin → go dashboard (NOT login)
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;

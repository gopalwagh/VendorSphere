import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";
import { getRoleHomePath, normalizeRole } from "../features/auth/roleUtils";

const ProtectedRoute = ({ children, roles =[], }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const normalizedRole = normalizeRole(user?.role);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if(roles.length && !roles.includes(normalizedRole)) {
    return (
      <Navigate to={getRoleHomePath(normalizedRole)} replace />
    );
  }
  return children;
}

export default ProtectedRoute;

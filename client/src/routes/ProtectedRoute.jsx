import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const ProtectedRoute = ({ children, roles =[], }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if(roles.length && !roles.includes(user?.role)) {
    return (
      <Navigate
        to={user?.role === "superAdmin" ? "/super-admin" : "/"}
        replace
      />
    );
  }
  return children;
}

export default ProtectedRoute;

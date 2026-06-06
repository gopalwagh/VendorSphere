import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/common/Loader/Loader";

const ProtectedRoute = ({ children, roles =[], }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader />;
  }

  if(roles.length && !roles.includes(user.role)) {
    return (
      <Navigate to="/" />
    );
  }
  return children;
}

export default ProtectedRoute;
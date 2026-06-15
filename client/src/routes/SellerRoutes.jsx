import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";
import Loader from "../components/Loader/Loader";

const SellerApprovedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  if(loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch( user?. sellerStatus) {
    case "approved":
      return children;
    case "not_applied":
    case "pending":
    case "rejected":
      return (
        <Navigate to="/seller/application" />
      );
    default:
      return (
        <Navigate to="/" />
      );       
  
  }
};

export default SellerApprovedRoute;

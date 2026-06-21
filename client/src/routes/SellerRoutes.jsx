import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Loader/Loader";
import { ROLES, normalizeRole } from "../features/auth/roleUtils";
import { fetchSellerProfileThunk } from "../features/superAdmin/superAdminThunk";

const SellerApprovedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const { sellerProfile, loading: sellerLoading } = useSelector((state) => state.superAdmin);
  const normalizedRole = normalizeRole(user?.role);
  const resolvedStatus = sellerProfile?.applicationStatus || user?.sellerStatus;

  useEffect(() => {
    if (isAuthenticated && normalizedRole === ROLES.SELLER && !resolvedStatus) {
      dispatch(fetchSellerProfileThunk());
    }
  }, [dispatch, isAuthenticated, normalizedRole, resolvedStatus]);

  if(loading) return <Loader />;
  if (sellerLoading && normalizedRole === ROLES.SELLER) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (resolvedStatus) {
    case "approved":
      return children;
    case "not_applied":
    case "pending":
    case "rejected":
      return (
        <Navigate to="/seller/application" replace />
      );
    default:
      return (
        <Navigate to="/seller/application" replace />
      );       
  
  }
};

export default SellerApprovedRoute;

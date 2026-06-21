import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import SellerApplication from "./SellerApplication";
import SellerPending from "./SellerPending";
import SellerRejected from "./SellerRejected";
import Loader from "../../components/Loader/Loader";
import { ROLES, normalizeRole } from "../../features/auth/roleUtils";
import { fetchSellerProfileThunk } from "../../features/superAdmin/superAdminThunk";

const SellerStatus = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sellerProfile, loading: sellerLoading } = useSelector((state) => state.superAdmin);
  const status = sellerProfile?.applicationStatus || user?.sellerStatus;
  const normalizedRole = normalizeRole(user?.role);

  useEffect(() => {
    if (normalizedRole === ROLES.SELLER && !sellerProfile) {
      dispatch(fetchSellerProfileThunk());
    }
  }, [dispatch, normalizedRole, sellerProfile]);

  if (sellerLoading) {
    return <Loader />;
  }
  
  if(status === "not_applied"){
    return <SellerApplication />;
  }

  if (status === "pending") {
    return <SellerPending />;
  }

  if (status === "rejected") {
    return <SellerRejected />;
  }

  if (status === "approved") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

export default SellerStatus;

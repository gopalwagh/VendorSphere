import { useSelector } from "react-redux";
import SellerApplication from "./SellerApplication";
import SellerPending from "./SellerPending";
import SellerRejected from "./SellerRejected";

const SellerStatus = () => {
  const { user } = useSelector((state) => state.auth);
  const status = user?.sellerStatus;
  
  if(status === "not_applied"){
    return <SellerApplication />;
  }

  if (status === "pending") {
    return <SellerPending />;
  }

  if (status === "rejected") {
    return <SellerRejected />;
  }

  return null;
};

export default SellerStatus;
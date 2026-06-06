import "./DashboardSidebar.css";
import { Link } from "react-router-dom";

const DashboardSidebar = () => {
 return (
    <aside className="sidebar">
      <h2>Seller Panel</h2>
      <Link to="/dashboard">
        Dashboard
      </Link>
      <Link to="/dashboard/products">
        Products
      </Link>
      <Link to="/dashboard/orders">
        Orders
      </Link>
      <Link to="/dashboard/analytics">
        Analytics
      </Link>
      <Link to="/dashboard/coupons">
        Coupons
      </Link>
    </aside>
  );
};

export default DashboardSidebar;
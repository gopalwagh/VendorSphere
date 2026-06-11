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
      <Link to="/dashboard/products/create">
        Create
      </Link>
      <Link to="/dashboard/orders">
        Orders
      </Link>
      <Link to="/dashboard/analytics">
        Analytics
      </Link>
    </aside>
  );
};

export default DashboardSidebar;
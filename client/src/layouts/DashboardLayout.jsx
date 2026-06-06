import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import DashboardSidebar from "../components/dashboard/DashboardSidebar/DashboardSidebar";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
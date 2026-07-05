import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import Sidebar from "../components/Sidebar/sidebar";
import BusinessCopilot from "../components/BusinessCopilot/BusinessCopilot.jsx";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
      <BusinessCopilot />
    </div>
  );
};

export default DashboardLayout;

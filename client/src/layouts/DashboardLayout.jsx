import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import Sidebar from "../components/Sidebar/sidebar";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

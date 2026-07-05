import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/sidebar";
import BusinessCopilot from "../../components/BusinessCopilot/BusinessCopilot";

const SuperAdminLayout = () => {
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

export default SuperAdminLayout;

import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/sidebar";

const SuperAdminLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;

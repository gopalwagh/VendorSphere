import "./DashboardHome.css";

const DashboardHome = () => {
  return (
    <div>
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          Revenue
        </div>
        <div className="stat-card">
          Orders
        </div>
        <div className="stat-card">
          Products
        </div>
        <div className="stat-card">
          Users
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
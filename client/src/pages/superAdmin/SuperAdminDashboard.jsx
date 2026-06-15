import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSuperAdminDashboardThunk, fetchPendingApplicationThunk } from "../../features/seller/sellerThunk.js";
import Loader from "../../components/Loader/Loader";
import "./SuperAdminDashboard.css";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiUsers, FiCheckCircle, FiClock, FiDollarSign } from "react-icons/fi";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PIE_COLORS = ["#16a34a", "#f97316", "#dc2626"];

function formatCurrency(n = 0) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + Math.round(n);
}

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const { superAdminDashboard, loading } = useSelector((state) => state.seller);

  const {
    summary = {},
    revenueChart = [],
    sellerStatusStats = [],
    topCategories = [],
    topSellers = [],
  } = superAdminDashboard || {};
  
  const { pendingApplications = [] } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSuperAdminDashboardThunk());
    dispatch(fetchPendingApplicationThunk());
  }, [dispatch]);

  if (loading) return <Loader />;

  const revenueData = revenueChart.map(d => ({
    month: MONTHS[(d._id.month || 1) - 1],
    revenue: d.revenue
  }));

  const pieData = sellerStatusStats.map(stat => ({
    name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
    value: stat.count
  }));

  return (
    <div className="page-container">
      <div className="page-header-row">
        <h1>SuperAdmin Dashboard</h1>
        <div className="date-badge">{new Date().toLocaleDateString()}</div>
      </div>

      {/* Stats Overview */}
      <div className="sa-stats-grid">
        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ background: "rgba(15, 118, 110, 0.1)", color: "var(--primary)" }}>
            <FiUsers />
          </div>
          <div className="sa-stat-info">
            <p>Total Users</p>
            <h3>{summary.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ background: "rgba(22, 163, 74, 0.1)", color: "var(--success)" }}>
            <FiCheckCircle />
          </div>
          <div className="sa-stat-info">
            <p>Approved Sellers</p>
            <h3>{summary.totalSellers || 0}</h3>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ background: "rgba(249, 115, 22, 0.1)", color: "var(--accent)" }}>
            <FiClock />
          </div>
          <div className="sa-stat-info">
            <p>Pending Apps</p>
            <h3>{summary.pendingApplications || 0}</h3>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ background: "rgba(15, 118, 110, 0.1)", color: "var(--primary)" }}>
            <FiDollarSign />
          </div>
          <div className="sa-stat-info">
            <p>Platform Revenue</p>
            <h3>{formatCurrency(summary.platformRevenue)}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="sa-charts-grid">
        <div className="sa-chart-card">
          <h3>Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="sa-chart-card">
          <h3>Seller Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="sa-pie-legend">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="sa-legend-item">
                <span className="sa-legend-color" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span>{entry.name}</span>
                <span className="sa-legend-value">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="sa-bottom-grid">
        <div className="sa-list-card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
             <h3>Recent Pending Applications</h3>
          </div>
          {pendingApplications.length === 0 ? (
             <p className="sa-empty-text">No pending applications at the moment.</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Applicant</th>
                    <th>Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApplications.slice(0, 5).map((app) => (
                    <tr key={app._id}>
                      <td><strong>{app.storeName}</strong></td>
                      <td>{app.user?.name}</td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sa-list-card">
          <h3>Top Sellers</h3>
          <div className="sa-list">
            {topSellers.map((seller, idx) => (
              <div key={seller._id || idx} className="sa-list-item">
                <div className="sa-rank">{idx + 1}</div>
                <div className="sa-list-content">
                  <p className="sa-list-title">{seller.storeName}</p>
                  <p className="sa-list-subtitle">{seller.user?.name || "Unknown"}</p>
                </div>
                <div className="sa-list-value">{formatCurrency(seller.totalRevenue)}</div>
              </div>
            ))}
            {topSellers.length === 0 && <p className="sa-empty-text">No seller data available</p>}
          </div>
        </div>

        <div className="sa-list-card">
          <h3>Top Categories</h3>
          <div className="sa-list">
            {topCategories.map((cat, idx) => (
              <div key={cat._id || idx} className="sa-list-item">
                <div className="sa-rank">{idx + 1}</div>
                <div className="sa-list-content">
                  <p className="sa-list-title">{cat._id}</p>
                  <p className="sa-list-subtitle">{cat.quantity} items sold</p>
                </div>
                <div className="sa-list-value">{formatCurrency(cat.revenue)}</div>
              </div>
            ))}
            {topCategories.length === 0 && <p className="sa-empty-text">No category data available</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard;
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSuperAdminDashboardThunk } from "../../features/superAdmin/superAdminThunk.js";
import Loader from "../../components/Loader/Loader";
import "./SuperAdminDashboard.css";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import {
  FiUsers, FiCheckCircle, FiClock, FiDollarSign,
  FiShoppingBag, FiActivity, FiTrendingUp, FiAward,
} from "react-icons/fi";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PIE_COLORS = ["#16a34a", "#f97316", "#dc2626", "#6366f1", "#0ea5e9"];
const STATUS_LABEL = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

function formatCurrency(n = 0) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + Math.round(n);
}

function StatCard({ icon: Icon, label, value, color, gradient, trend }) {
  return (
    <div className="sad-stat-card" style={{ "--sc-color": color, "--sc-grad": gradient }}>
      <div className="sad-stat-icon"><Icon /></div>
      <div className="sad-stat-body">
        <p className="sad-stat-label">{label}</p>
        <h3 className="sad-stat-value">{value}</h3>
        {trend && <span className="sad-stat-trend">{trend}</span>}
      </div>
    </div>
  );
}

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const { superAdminDashboard, loading } = useSelector((state) => state.superAdmin);

  const {
    summary = {},
    revenueChart = [],
    sellerStatusStats = [],
    topCategories = [],
    topSellers = [],
  } = superAdminDashboard || {};

  useEffect(() => {
    dispatch(fetchSuperAdminDashboardThunk());
  }, [dispatch]);

  if (loading) return <Loader />;

  const recentPendingApplications = superAdminDashboard?.recentPendingApplications || [];

  // Revenue chart data
  const revenueData = revenueChart.map((d) => ({
    month: MONTHS[(d._id?.month || 1) - 1],
    revenue: d.revenue || 0,
    orders: d.orders || 0,
  }));

  // Pie data for seller status
  const pieData = sellerStatusStats.map((stat) => ({
    name: STATUS_LABEL[stat._id] || stat._id,
    value: stat.count,
  }));

  // Top products bar data
  const productData = topCategories.slice(0, 6).map((c) => ({
    name: c.name,
    revenue: c.revenue || 0,
    qty: c.sold,
  }));

  const totalSellers = pieData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="sad-page">
      {/* Header */}
      <div className="sad-header">
        <div>
          <span className="sad-eyebrow">Platform Control</span>
          <h1>SuperAdmin Dashboard</h1>
          <p className="sad-subtitle">Platform-wide overview and analytics</p>
        </div>
        <div className="sad-date">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="sad-stats-grid">
        <StatCard
          icon={FiUsers}
          label="Total Users"
          value={(summary.totalUsers || 0).toLocaleString()}
          color="#6366f1"
          gradient="rgba(99,102,241,0.12)"
          trend="Registered users"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Approved Sellers"
          value={(summary.totalSellers || 0).toLocaleString()}
          color="#16a34a"
          gradient="rgba(22,163,74,0.12)"
          trend="Active sellers"
        />
        <StatCard
          icon={FiClock}
          label="Pending Applications"
          value={(summary.pendingApplications || 0).toLocaleString()}
          color="#f97316"
          gradient="rgba(249,115,22,0.12)"
          trend="Awaiting review"
        />
        <StatCard
          icon={FiDollarSign}
          label="Platform Revenue"
          value={formatCurrency(summary.platformRevenue)}
          color="#0f766e"
          gradient="rgba(15,118,110,0.12)"
          trend="Total commissions"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="sad-charts-row">
        {/* Revenue Area Chart */}
        <div className="sad-chart-card sad-chart-lg">
          <div className="sad-chart-head">
            <div>
              <h3>Platform Revenue</h3>
              <p>Monthly revenue trend</p>
            </div>
            <span className="sad-badge primary">Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="sadRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(v, name) => [name === "revenue" ? formatCurrency(v) : v, name === "revenue" ? "Revenue" : "Orders"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(15,23,42,0.08)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2.5} fill="url(#sadRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Seller Status Pie */}
        <div className="sad-chart-card">
          <div className="sad-chart-head">
            <div>
              <h3>Seller Applications</h3>
              <p>Status distribution</p>
            </div>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="sad-pie-legend">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="sad-legend-item">
                    <span className="sad-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="sad-legend-name">{entry.name}</span>
                    <span className="sad-legend-count">{entry.value}</span>
                    <span className="sad-legend-pct">
                      {Math.round((entry.value / totalSellers) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="sad-empty">No seller data available</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="sad-charts-row2">
        {/* Top Categories */}
        <div className="sad-chart-card sad-chart-lg">
          <div className="sad-chart-head">
            <div>
              <h3>Top Products by Revenue</h3>
              <p>Best performing product on Platform</p>
            </div>
            <span className="sad-badge amber">Products</span>
          </div>
  
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={productData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(15,23,42,0.06)" />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={90} />
                <Tooltip
                  formatter={(v, name) => [name === "revenue" ? formatCurrency(v) : v, name === "revenue" ? "Revenue" : "Units"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid rgba(15,23,42,0.08)" }}
                />
                <Bar dataKey="revenue" fill="#0f766e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="sad-empty">No category data available</div>
          )}
        </div>

        {/* Top Sellers & Pending - Side Lists */}
        <div className="sad-side-col">
          {/* Top Sellers */}
          <div className="sad-list-card">
            <div className="sad-list-head">
              <FiAward />
              <h3>Top Sellers</h3>
            </div>

            {topSellers.length === 0 ? (
              <div className="sad-empty">No seller data available</div>
            ) : (
              <div className="sad-list">
                {topSellers.map((seller, idx) => (
                  <div key={seller._id || idx} className="sad-list-item">
                    <div className={`sad-rank ${idx === 0 ? "gold" : ""}`}>{idx + 1}</div>
                    <div className="sad-list-info">
                      <p className="sad-list-title">{seller.sellerName}</p>
                      <p className="sad-list-sub">{seller.orders}</p>
                    </div>
                    <div className="sad-list-val">{formatCurrency(seller.revenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Applications Table */}
      <div className="sad-table-card">
        <div className="sad-table-head">
          <div>
            <h3>Recent Pending Applications</h3>
            <p>Seller applications awaiting review</p>
          </div>
          {recentPendingApplications.length > 0 && (
            <span className="sad-pending-count">{recentPendingApplications.length} pending</span>
          )}
        </div>

        {recentPendingApplications.length === 0 ? (
          <div className="sad-empty-state">
            <span>✅</span>
            <p>No pending applications — all caught up!</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPendingApplications.map((app) => (
                  <tr key={app._id}>
                    <td><strong>{app.storeName}</strong></td>
                    <td>{app.user?.name || "—"}</td>
                    <td>{app.user?.email || "—"}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      <span className="status-badge pending">Pending</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

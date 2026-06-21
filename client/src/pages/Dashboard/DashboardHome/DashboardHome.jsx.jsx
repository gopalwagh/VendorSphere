import "./DashboardHome.css";
import Loader from "../../../components/Loader/Loader";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAdminOrdersThunk } from "../../../features/orders/orderThunk";
import { fetchAdminProductsThunk } from "../../../features/products/productThunk";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";
import {
  FiShoppingBag, FiDollarSign, FiTrendingUp, FiClock,
  FiPackage, FiAlertTriangle, FiCheckCircle, FiXCircle,
} from "react-icons/fi";

const STATUS_COLORS = {
  processing: "#6366f1",
  packed: "#0ea5e9",
  shipped: "#f59e0b",
  out_for_delivery: "#8b5cf6",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

const PIE_COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#8b5cf6", "#16a34a", "#dc2626"];

function formatCurrency(n = 0) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + Math.round(n);
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function StatCard({ icon: Icon, label, value, sub, color, gradient }) {
  return (
    <div className="dh-stat-card" style={{ "--card-color": color, "--card-gradient": gradient }}>
      <div className="dh-stat-icon">
        <Icon />
      </div>
      <div className="dh-stat-body">
        <p className="dh-stat-label">{label}</p>
        <h3 className="dh-stat-value">{value}</h3>
        {sub && <span className="dh-stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

const DashboardHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { adminOrders, loading } = useSelector((state) => state.orders);
  const { adminProducts } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!adminOrders?.length) {
      dispatch(fetchAdminOrdersThunk());
    }
    if (!adminProducts?.length) {
      dispatch(fetchAdminProductsThunk());
    }
  }, [dispatch, adminOrders?.length, adminProducts?.length]);

  const dashboardStats = useMemo(() => {
    const lowStockProducts = adminProducts.filter(
      (product) => product.stock <= 5 && product.stock > 0
    );

    const outOfStockProducts = adminProducts.filter(
      (product) => product.stock === 0
    );

    const paidOrders = adminOrders.filter((o) => o.paymentStatus === "paid");
    const recentOrders = paidOrders.slice(0, 8);

    const totalCommission = adminOrders.reduce(
      (sum, order) =>
        sum + order.orderItems.reduce(
          (itemSum, item) => itemSum + (item.commissionAmount || 0),
          0
        ),
      0
    );

    const totalOrders = paidOrders.length;

    const totalRevenue = adminOrders.reduce(
      (sum, order) =>
        order.paymentStatus === "paid" ? sum + (order.sellerRevenue || 0) : sum,
      0
    );

    const totalSellerRevenue = adminOrders.reduce(
      (sum, order) =>
        order.paymentStatus === "paid" ? sum + (order.sellerEarnings || 0) : sum,
      0
    );

    const deliveredOrder = adminOrders.filter(
      (order) => order.orderStatus === "delivered"
    ).length;

    const pendingOrders = adminOrders.filter(
      (order) => order.paymentStatus === "paid" && order.orderStatus !== "delivered" && order.orderStatus !== "cancelled"
    ).length;

    const statusCounts = {
      processing: 0,
      packed: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    const revenueByMonth = {};
    const productMap = {};

    adminOrders.forEach((order) => {
      // Monthly revenue
      if (order.paymentStatus === "paid" && order.createdAt) {
        const monthIndex = new Date(order.createdAt).getMonth(); // June -> 5
        const monthKey = Number(monthIndex);
        const amount = order.sellerEarnings || order.sellerRevenue || 0;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + amount;
      }

      order.orderItems.forEach((item) => {
        if (statusCounts && item.itemStatus in statusCounts) {
          statusCounts[item.itemStatus] += 1;
        }

        const productId = item.product?._id || item.product || item._id;
        if (!productId) return;

        if (!productMap[productId]) {
          productMap[productId] = {
            title: item.product?.title || item.productTitle || "Unknown",
            quantitySold: 0,
            revenue: 0,
          };
        }

        productMap[productId].quantitySold += Number(item.quantity || 0);
        productMap[productId].revenue += Number(item.price || 0) * Number(item.quantity || 0);
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // Revenue chart data (last 6 months)
    const now = new Date();
    const revenueChartData = Array.from({ length: 6 }, (_, i) => {
      const month = (now.getMonth() - 5 + i + 12) % 12;
      const targetKey = Number(month);
      return {
        month: MONTHS[targetKey],
        revenue: Math.round(revenueByMonth[targetKey] || 0),
      };
    });

    // Pie data for status distribution
    const pieData = Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace(/_/g, " "),
        value: count,
      }));

    return {
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      totalCommission,
      totalOrders,
      totalRevenue,
      totalSellerRevenue,
      deliveredOrder,
      pendingOrders,
      statusCounts,
      topProducts,
      revenueChartData,
      pieData,
    };
  }, [adminOrders, adminProducts]);

  if (loading) { return <Loader />; }

  const deliveryRate = dashboardStats.totalOrders > 0
    ? Math.round((dashboardStats.deliveredOrder / dashboardStats.totalOrders) * 100)
    : 0;

  console.log(adminOrders)
  return (
    <div className="dh-page">
      {/* Header */}
      <div className="dh-header">
        <div>
          <span className="dh-eyebrow">Seller Operations</span>
          <h1>Dashboard Overview</h1>
          <p className="dh-subtitle">Welcome back, {user?.name || "Admin"} 👋</p>
        </div>
        <div className="dh-date-badge">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dh-stats-grid">
        <StatCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={formatCurrency(dashboardStats.totalRevenue)}
          sub="from paid orders"
          color="#16a34a"
          gradient="rgba(22,163,74,0.12)"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Seller Revenue"
          value={formatCurrency(dashboardStats.totalSellerRevenue)}
          sub="excluding commission"
          color="#0f766e"
          gradient="rgba(15,118,110,0.12)"
        />
        <StatCard
          icon={FiShoppingBag}
          label="Total Orders"
          value={dashboardStats.totalOrders}
          sub={`${dashboardStats.deliveredOrder} delivered`}
          color="#6366f1"
          gradient="rgba(99,102,241,0.12)"
        />
        <StatCard
          icon={FiClock}
          label="Pending Orders"
          value={dashboardStats.pendingOrders}
          sub="awaiting fulfillment"
          color="#f59e0b"
          gradient="rgba(245,158,11,0.12)"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Commission Paid "
          value={formatCurrency(dashboardStats.totalCommission)}
          sub="platform earnings"
          color="#8b5cf6"
          gradient="rgba(139,92,246,0.12)"
        />
        <StatCard
          icon={FiPackage}
          label="Total Products"
          value={adminProducts.length}
          sub={`${dashboardStats.outOfStockProducts.length} out of stock`}
          color="#0ea5e9"
          gradient="rgba(14,165,233,0.12)"
        />
      </div>

      {/* Charts Row */}
      <div className="dh-charts-row">
        {/* Revenue Bar Chart */}
        <div className="dh-chart-card dh-chart-wide">
          <div className="dh-chart-header">
            <h3>Revenue (Last 6 Months)</h3>
            <span className="dh-chart-badge">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dashboardStats.revenueChartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(val) => [formatCurrency(val), "Revenue"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 8px 20px rgba(15,23,42,0.1)" }}
              />
              <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="dh-chart-card">
          <div className="dh-chart-header">
            <h3>Order Status Distribution</h3>
            <span className="dh-chart-badge">Live</span>
          </div>
          {dashboardStats.pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dashboardStats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboardStats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "13px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dh-pie-legend">
                {dashboardStats.pieData.map((entry, i) => (
                  <div key={entry.name} className="dh-legend-row">
                    <span className="dh-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="dh-legend-label">{entry.name}</span>
                    <span className="dh-legend-val">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="dh-empty-chart">No order data yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="dh-bottom-row">
        {/* Recent Orders */}
        <div className="dh-table-card">
          <div className="dh-section-header">
            <h3>Recent Orders</h3>
            <button className="dh-view-all" onClick={() => navigate("/dashboard/orders")}>
              View All →
            </button>
          </div>
          <div className="dh-table-wrap">
            <table className="dh-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardStats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="dh-no-data">No recent orders</td>
                  </tr>
                ) : (
                  dashboardStats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td><span className="dh-order-id">#{order._id.slice(-6).toUpperCase()}</span></td>
                      <td>{order.customer?.name || "—"}</td>
                      <td className="dh-amount">{formatCurrency(order.sellerRevenue || 0)}</td>
                      <td>
                        <span className={`dh-status-pill ${order.orderStatus}`}>
                          {order.orderStatus?.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="dh-list-card">
          <div className="dh-section-header">
            <h3>Top Selling Products</h3>
          </div>
          {dashboardStats.topProducts.length === 0 ? (
            <div className="dh-empty-chart">No sales data yet</div>
          ) : (
            <div className="dh-product-list">
              {dashboardStats.topProducts.map((product, index) => {
                const maxSold = dashboardStats.topProducts[0]?.quantitySold || 1;
                const pct = Math.round((product.quantitySold / maxSold) * 100);
                return (
                  <div key={index} className="dh-product-item">
                    <div className="dh-product-rank">{index + 1}</div>
                    <div className="dh-product-info">
                      <p className="dh-product-title">{product.title}</p>
                      <div className="dh-mini-bar-wrap">
                        <div className="dh-mini-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="dh-product-meta">
                        <span>{product.quantitySold} sold</span>
                        <span>{formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Rate Banner */}
      <div className="dh-delivery-banner">
        <div className="dh-banner-left">
          <FiCheckCircle />
          <div>
            <p>Delivery Success Rate</p>
            <h2>{deliveryRate}%</h2>
          </div>
        </div>
        <div className="dh-progress-wrap">
          <div className="dh-progress-bar" style={{ width: `${deliveryRate}%` }} />
        </div>
        <div className="dh-banner-right">
          <span>{dashboardStats.deliveredOrder} delivered</span>
          <span>of {dashboardStats.totalOrders} orders</span>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="dh-inventory-row">
        {/* Low Stock */}
        <div className="dh-inventory-card warn">
          <div className="dh-section-header">
            <h3><FiAlertTriangle style={{ color: "#f59e0b" }} /> Low Stock</h3>
            <span className="dh-count-pill warn">{dashboardStats.lowStockProducts.length}</span>
          </div>
          {dashboardStats.lowStockProducts.length === 0 ? (
            <div className="dh-empty-chart">All products well stocked 🎉</div>
          ) : (
            dashboardStats.lowStockProducts.slice(0, 8).map((product) => (
              <div key={product._id} className="dh-inv-item">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.title}
                  className="dh-inv-img"
                />
                <div className="dh-inv-info">
                  <p className="dh-inv-title">{product.title}</p>
                  <span className="dh-inv-stock warn">Only {product.stock} left</span>
                </div>
                <button
                  className="dh-inv-btn warn"
                  onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                >
                  Edit
                </button>
              </div>
            ))
          )}
        </div>

        {/* Out of Stock */}
        <div className="dh-inventory-card danger">
          <div className="dh-section-header">
            <h3><FiXCircle style={{ color: "#dc2626" }} /> Out of Stock</h3>
            <span className="dh-count-pill danger">{dashboardStats.outOfStockProducts.length}</span>
          </div>
          {dashboardStats.outOfStockProducts.length === 0 ? (
            <div className="dh-empty-chart">No out-of-stock products 🎉</div>
          ) : (
            dashboardStats.outOfStockProducts.slice(0, 8).map((product) => (
              <div key={product._id} className="dh-inv-item">
                <img
                  src={product.images?.[0]?.url}
                  alt={product.title}
                  className="dh-inv-img"
                />
                <div className="dh-inv-info">
                  <p className="dh-inv-title">{product.title}</p>
                  <span className="dh-inv-stock danger">Out of stock</span>
                </div>
                <button
                  className="dh-inv-btn danger"
                  onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                >
                  Restock
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

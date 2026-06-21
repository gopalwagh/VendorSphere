import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { fetchAnalyticsThunk } from "../../../features/seller/sellerThunk.js";
import "./Analytics.css";
import {
  FiDollarSign, FiShoppingBag, FiPackage, FiStar,
  FiTrendingUp, FiAward,
} from "react-icons/fi";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CHART_COLORS = ["#0f766e", "#6366f1", "#f59e0b", "#dc2626", "#0ea5e9", "#8b5cf6"];

function formatCurrency(n = 0) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + Math.round(n);
}

function StarRating({ rating = 0 }) {
  const full = Math.floor(rating);
  return (
    <span className="an-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < full ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
      <span className="an-rating-val">{Number(rating).toFixed(1)}</span>
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, accent = false, sub }) {
  return (
    <div className={`an-kpi-card${accent ? " accent" : ""}`}>
      <div className="an-kpi-icon">
        <Icon />
      </div>
      <div className="an-kpi-body">
        <p className="an-kpi-label">{label}</p>
        <div className="an-kpi-value">{value}</div>
        {sub && <span className="an-kpi-sub">{sub}</span>}
      </div>
    </div>
  );
}

export default function Analytics() {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((s) => s.seller);

  const {
    summary = {},
    revenueChart = [],
    ordersChart = [],
    topCategories = [],
    topProducts = [],
    topRatedProducts = [],
    bestCategory = {},
  } = analytics || {};

  useEffect(() => {
    dispatch(fetchAnalyticsThunk());
  }, [dispatch]);

  const revenueData = revenueChart.map((d) => ({
    month: MONTHS[(d._id?.month || 1) - 1],
    revenue: d.revenue || 0,
  }));

  const ordersData = ordersChart.map((d) => ({
    month: MONTHS[(d._id?.month || 1) - 1],
    orders: d.orders || 0,
  }));

  // Merge revenue + orders by month for combined chart
  const combinedData = revenueData.map((r, i) => ({
    month: r.month,
    revenue: r.revenue,
    orders: ordersData[i]?.orders || 0,
  }));

  const bc = Array.isArray(bestCategory) ? bestCategory[0] : bestCategory;
  const maxProd = topProducts[0]?.totalSold || 1;
  const maxCat = topCategories[0]?.revenue || 1;

  // Category pie data
  const catPieData = topCategories.slice(0, 5).map((c) => ({
    name: c._id,
    value: c.revenue || 0,
  }));

  if (error) {
    return (
      <div className="an-error">
        <span>⚠️</span>
        <p>Could not load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="an-page">
      {/* Header */}
      <div className="an-header">
        <div>
          <span className="an-eyebrow">Seller Analytics</span>
          <h1>Performance Insights</h1>
          <p className="an-subtitle">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="an-kpi-grid">
        <KpiCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={loading ? "—" : formatCurrency(summary.totalRevenue || 0)}
          sub="from all paid orders"
          accent
        />
        <KpiCard
          icon={FiShoppingBag}
          label="Total Orders"
          value={loading ? "—" : (summary.totalOrders || 0).toLocaleString()}
          sub="confirmed orders"
        />
        <KpiCard
          icon={FiPackage}
          label="Units Sold"
          value={loading ? "—" : (summary.totalProductsSold || 0).toLocaleString()}
          sub="products fulfilled"
        />
        <KpiCard
          icon={FiStar}
          label="Avg Rating"
          value={loading ? "—" : <StarRating rating={summary.averageRating || 0} />}
          sub={`from customer reviews`}
        />
      </div>

      {/* Best Category Banner */}
      {bc?._id && (
        <div className="an-best-banner">
          <div className="an-best-icon">🏆</div>
          <div className="an-best-info">
            <span className="an-best-label">Top Performing Category</span>
            <h2 className="an-best-name">{bc._id}</h2>
          </div>
          <div className="an-best-stats">
            <div className="an-best-stat">
              <span>{formatCurrency(bc.revenue)}</span>
              <small>Revenue</small>
            </div>
            <div className="an-best-divider" />
            <div className="an-best-stat">
              <span>{bc.quantity}</span>
              <small>Units Sold</small>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="an-charts-grid">
        {/* Revenue Area Chart */}
        <div className="an-chart-card an-chart-lg">
          <div className="an-chart-head">
            <div>
              <h3>Revenue Trend</h3>
              <p>Monthly revenue over time</p>
            </div>
            <span className="an-chart-badge primary">Revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [formatCurrency(v), "Revenue"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(15,23,42,0.08)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: "#0f766e" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Line Chart */}
        <div className="an-chart-card">
          <div className="an-chart-head">
            <div>
              <h3>Orders Trend</h3>
              <p>Monthly orders count</p>
            </div>
            <span className="an-chart-badge indigo">Orders</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [v, "Orders"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(15,23,42,0.08)" }}
              />
              <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Revenue Bar + Pie */}
      <div className="an-charts-grid2">
        <div className="an-chart-card an-chart-lg">
          <div className="an-chart-head">
            <div>
              <h3>Category Revenue</h3>
              <p>Top categories by revenue</p>
            </div>
            <span className="an-chart-badge amber">Categories</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topCategories.slice(0, 6)} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(15,23,42,0.06)" />
              <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis type="category" dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={90} />
              <Tooltip
                formatter={(v) => [formatCurrency(v), "Revenue"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(15,23,42,0.08)" }}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                {topCategories.slice(0, 6).map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="an-chart-card">
          <div className="an-chart-head">
            <div>
              <h3>Category Share</h3>
              <p>Revenue distribution</p>
            </div>
          </div>
          {catPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={catPieData} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                    {catPieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="an-pie-legend">
                {catPieData.map((c, i) => (
                  <div key={c.name} className="an-legend-item">
                    <span className="an-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="an-legend-name">{c.name}</span>
                    <span className="an-legend-val">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="an-empty">No category data</div>
          )}
        </div>
      </div>

      {/* Bottom Lists */}
      <div className="an-lists-grid">
        {/* Top Products */}
        <div className="an-list-card">
          <div className="an-list-head">
            <FiTrendingUp />
            <h3>Top Selling Products</h3>
          </div>
          {topProducts.length === 0 ? (
            <div className="an-empty">No product data yet</div>
          ) : (
            <div className="an-list">
              {topProducts.map((p, i) => {
                const pct = Math.round((p.totalSold / maxProd) * 100);
                return (
                  <div key={i} className="an-list-item">
                    <div className="an-list-rank">{i + 1}</div>
                    <div className="an-list-body">
                      <p className="an-list-name">{p.product?.title || "Unknown"}</p>
                      <div className="an-bar-wrap">
                        <div className="an-bar" style={{ width: `${pct}%`, background: "#0f766e" }} />
                      </div>
                      <div className="an-list-meta">
                        <span>{p.totalSold} sold</span>
                        <span>{formatCurrency(p.revenue || 0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="an-list-card">
          <div className="an-list-head">
            <FiPackage />
            <h3>Top Categories</h3>
          </div>
          {topCategories.length === 0 ? (
            <div className="an-empty">No category data yet</div>
          ) : (
            <div className="an-list">
              {topCategories.map((c, i) => {
                const pct = Math.round((c.revenue / maxCat) * 100);
                return (
                  <div key={i} className="an-list-item">
                    <div className="an-list-rank" style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}18`, color: CHART_COLORS[i % CHART_COLORS.length] }}>
                      {i + 1}
                    </div>
                    <div className="an-list-body">
                      <p className="an-list-name">{c._id}</p>
                      <div className="an-bar-wrap">
                        <div className="an-bar" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                      <div className="an-list-meta">
                        <span>{c.quantity} units</span>
                        <span>{formatCurrency(c.revenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Rated Products */}
        <div className="an-list-card">
          <div className="an-list-head">
            <FiAward />
            <h3>Top Rated Products</h3>
          </div>
          {topRatedProducts.length === 0 ? (
            <div className="an-empty">No rating data yet</div>
          ) : (
            <div className="an-list">
              {topRatedProducts.map((p, i) => (
                <div key={i} className="an-list-item">
                  <div className="an-list-rank" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                    {i + 1}
                  </div>
                  <div className="an-list-body">
                    <p className="an-list-name">{p.title}</p>
                    <StarRating rating={p.averageRating || 0} />
                    <p className="an-reviews">{p.numOfReviews || 0} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

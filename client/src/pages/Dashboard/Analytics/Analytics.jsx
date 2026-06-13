import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAnalyticsThunk } from "../../../features/admin/adminThunk";
import "./Analytics.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatCurrency(n = 0) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + Math.round(n);
}

function Stars({ rating = 0 }) {
  return (
    <span className="stars">
      {"★".repeat(Math.floor(rating))}
      <span className="rating-text">{rating.toFixed(1)}</span>
    </span>
  );
}

function MetricCard({ icon, label, value, green }) {
  return (
    <div className="metric-card">
      <div className="metric-label">
        <span>{icon}</span>
        {label}
      </div>
      <div className={`metric-value ${green ? "green" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function RankedList({ items = [], renderItem }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="list-item">
          <span className="list-rank">{i + 1}</span>
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}

function MiniBar({ value, max, color = "#1D9E75" }) {
  return (
    <div className="bar-wrap">
      <div
        className="bar-fill"
        style={{ width: `${(value / max) * 100}%`, background: color }}
      />
    </div>
  );
}

export default function Analytics() {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((s) => s.admin);

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

  const revenueData = revenueChart.map(d => ({
    month: MONTHS[(d._id.month || 1) - 1],
    revenue: d.revenue
  }));

  const ordersData = ordersChart.map(d => ({
    month: MONTHS[(d._id.month || 1) - 1],
    orders: d.orders
  }));

  const bc = Array.isArray(bestCategory) ? bestCategory[0] : bestCategory;

  const maxProd = topProducts[0]?.totalSold || 1;
  const maxCat = topCategories[0]?.revenue || 1;

  if (error) {
    return <div className="error">⚠️ Could not load analytics</div>;
  }

  return (
    <div className="page">

      <div className="header">
        <h1>Analytics</h1>
        <p>{new Date().toLocaleDateString()}</p>
      </div>

      {/* SUMMARY */}
      {console.log(summary.totalOrders)}
      <div className="summary-grid">
        <MetricCard icon="💰" label="Revenue"
          value={loading ? "—" : formatCurrency(summary.totalRevenue || 0)} green />

        <MetricCard icon="🛍" label="Orders"
          value={loading ? "—" : (summary.totalOrders || 0).toLocaleString()} />

        <MetricCard icon="📦" label="Units"
          value={loading ? "—" : (summary.totalProductsSold || 0).toLocaleString()} />

        <MetricCard icon="⭐" label="Rating"
          value={loading ? "—" : <Stars rating={summary.averageRating || 0} />} />
      </div>

      {/* BEST CATEGORY */}
      {bc?._id && (
        <div className="best-category">
          <div className="badge">🏆</div>
          <div>
            <div className="label">Top Category</div>
            <div className="name">{bc._id}</div>
          </div>

          <div className="stats">
            <div>
              <div>{formatCurrency(bc.revenue)}</div>
              <small>Revenue</small>
            </div>
            <div>
              <div>{bc.quantity}</div>
              <small>Units</small>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS */}
      <div className="charts">

        <div className="card">
          <h3>Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#1D9E75" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Orders</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="orders" stroke="#378ADD" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* LISTS */}
      <div className="bottom">

        <div className="card">
          <h3>Top Products</h3>
          <RankedList
            items={topProducts}
            renderItem={(p) => (
              <div className="list-content">
                <div>{p.product?.title}</div>
                <MiniBar value={p.totalSold} max={maxProd} />
              </div>
            )}
          />
        </div>

        <div className="card">
          <h3>Top Categories</h3>
          <RankedList
            items={topCategories}
            renderItem={(c) => (
              <div className="list-content">
                <div>{c._id}</div>
                <MiniBar value={c.revenue} max={maxCat} color="#378ADD" />
              </div>
            )}
          />
        </div>

        <div className="card">
          <h3>Top Rated</h3>
          <RankedList
            items={topRatedProducts}
            renderItem={(p) => (
              <div className="list-content">
                <div>{p.title}</div>
                <small>{p.numOfReviews} reviews</small>
                <Stars rating={p.averageRating} />
              </div>
            )}
          />
        </div>

      </div>

    </div>
  );
}
import "./Analytics.css";

const Analytics = () => {
  return (
    <div className="analytics-page">
      <h1>Analytics</h1>
      <div className="analytics-grid">
        <div className="analytics-card">
          Revenue Chart
        </div>
        <div className="analytics-card">
          Orders Chart
        </div>
        <div className="analytics-card">
          Top Products
        </div>
        <div className="analytics-card">
          User Growth
        </div>
      </div>
    </div>
  );
};

export default Analytics;
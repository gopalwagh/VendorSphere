import "./SellerPending.css";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader/Loader.jsx";
import { FiClock, FiCheckCircle, FiPackage, FiShield } from "react-icons/fi";

const SellerPending = () => {
  const { sellerProfile, loading } = useSelector((state) => state.superAdmin);

  if (loading && !sellerProfile) return <Loader />;

  const storeLogo = sellerProfile?.storeLogo?.url;

  return (
    <div className="seller-status-page">
      <div className="status-card pending">
        <div className="status-icon-wrapper pending-icon">
          <FiClock />
        </div>

        <div className="status-header-copy">
          <span className="status-badge-inline pending">Pending review</span>
          <h1>Application under review</h1>
          <p className="status-subtitle">
            Your seller application has been submitted and our team is checking the details now.
          </p>
        </div>

        <div className="status-overview">
          <div className="store-logo-card">
            {storeLogo ? (
              <img src={storeLogo} alt={sellerProfile?.storeName || "Store logo"} />
            ) : (
              <div className="store-logo-fallback">
                {sellerProfile?.storeName?.slice(0, 1)?.toUpperCase() || "S"}
              </div>
            )}
          </div>

          <div className="status-overview-copy">
            <p className="status-label">Submitted store</p>
            <h2>{sellerProfile?.storeName || "Your seller application"}</h2>
            <p>
              {sellerProfile?.storeDescription ||
                "Your application is being evaluated for compliance, logistics, and seller readiness."}
            </p>
          </div>
        </div>

        <div className="status-summary-grid">
          <div className="status-summary-item">
            <FiPackage />
            <div>
              <span>Status</span>
              <strong>{sellerProfile?.applicationStatus || "Pending"}</strong>
            </div>
          </div>
          <div className="status-summary-item">
            <FiShield />
            <div>
              <span>Contact</span>
              <strong>{sellerProfile?.phone || "Waiting for details"}</strong>
            </div>
          </div>
          <div className="status-summary-item">
            <FiCheckCircle />
            <div>
              <span>Submitted</span>
              <strong>
                {sellerProfile?.createdAt
                  ? new Date(sellerProfile.createdAt).toLocaleDateString()
                  : "Just now"}
              </strong>
            </div>
          </div>
        </div>

        <div className="status-timeline">
          <div className="timeline-step completed">
            <div className="step-circle">1</div>
            <span>Submitted</span>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step active">
            <div className="step-circle">2</div>
            <span>Reviewing</span>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="step-circle">3</div>
            <span>Decision</span>
          </div>
        </div>

        <p className="status-hint">
          This usually takes 24 to 48 hours. We will notify you once the seller status changes.
        </p>
      </div>
    </div>
  );
};

export default SellerPending;

import "./SellerPending.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader/Loader.jsx";
import { FiEdit3, FiXCircle } from "react-icons/fi";
import SellerApplication from "./SellerApplication";

const SellerRejected = () => {
  const { sellerProfile, loading } = useSelector((state) => state.superAdmin);
  const [showResubmit, setShowResubmit] = useState(false);

  if (loading && !sellerProfile) return <Loader />;

  if (showResubmit) {
    return (
      <div className="seller-reapply-shell">
        <div className="seller-reapply-toolbar">
          <button
            type="button"
            className="back-status-btn"
            onClick={() => setShowResubmit(false)}
          >
            Back to status
          </button>
        </div>
        <SellerApplication />
      </div>
    );
  }

  return (
    <div className="seller-status-page">
      <div className="status-card rejected">
        <div className="status-icon-wrapper rejected-icon">
          <FiXCircle />
        </div>

        <div className="status-header-copy">
          <span className="status-badge-inline rejected">Rejected</span>
          <h1>Application rejected</h1>
          <p className="status-subtitle">
            The seller review team found issues that need to be fixed before approval.
          </p>
        </div>

        <div className="status-overview">
          <div className="store-logo-card">
            {sellerProfile?.storeLogo?.url ? (
              <img src={sellerProfile.storeLogo.url} alt={sellerProfile?.storeName || "Store logo"} />
            ) : (
              <div className="store-logo-fallback">
                {sellerProfile?.storeName?.slice(0, 1)?.toUpperCase() || "S"}
              </div>
            )}
          </div>

          <div className="status-overview-copy">
            <p className="status-label">Store details</p>
            <h2>{sellerProfile?.storeName || "Your seller application"}</h2>
            <p>{sellerProfile?.storeDescription || "No store description available."}</p>
          </div>
        </div>

        <div className="rejection-reason">
          <strong>Reason for rejection</strong>
          <p>{sellerProfile?.rejectionReason || "No specific reason was shared."}</p>
        </div>

        <div className="status-summary-grid">
          <div className="status-summary-item">
            <FiEdit3 />
            <div>
              <span>Next step</span>
              <strong>Review and resubmit</strong>
            </div>
          </div>
          <div className="status-summary-item">
            <FiXCircle />
            <div>
              <span>Review status</span>
              <strong>Needs changes</strong>
            </div>
          </div>
        </div>

        <div className="resubmit-actions">
          <button
            type="button"
            className="resubmit-btn"
            onClick={() => setShowResubmit(true)}
          >
            Update and resubmit
          </button>
          <p className="status-hint">
            You can edit the existing application details and submit a new review request.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerRejected;

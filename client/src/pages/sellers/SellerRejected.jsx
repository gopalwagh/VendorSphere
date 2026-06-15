import { useNavigate} from "react-router-dom";
import { useSelector } from "react-redux";
import "./SellerPending.css"; // Reuse shared styles
import { FiXCircle } from "react-icons/fi";
import SellerApplication from "./SellerApplication";
import { useState } from "react";

const SellerRejected = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showResubmit, setShowResubmit] = useState(false);

  if (showResubmit) {
    return (
      <div style={{ paddingTop: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '-20px', padding: '0 20px' }}>
          <button 
            className="modal-btn-cancel"
            onClick={() => setShowResubmit(false)}
            style={{ marginBottom: '10px' }}
          >
            ← Back to Status
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
        <h1>Application Rejected</h1>
        <p className="status-subtitle">
          Unfortunately, your application to become a seller has been rejected. Please review the reason below.
        </p>
        
        <div className="rejection-reason">
          <strong>Reason for Rejection:</strong>
          <p>{user?.sellerProfile?.rejectionReason || "No specific reason provided."}</p>
        </div>

        <div className="resubmit-actions">
          <button
            className="resubmit-btn"
            onClick={() => setShowResubmit(true)}
          >
            Update & Resubmit Application
          </button>
          <p className="status-hint" style={{ marginTop: '16px' }}>
            You can modify your details and submit a new application for review.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SellerRejected;
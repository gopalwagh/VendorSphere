import "./SellerPending.css";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader.jsx";
import { FiClock } from "react-icons/fi";

const SellerPending = () => {
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if(user?.sellerStatus === "approved"){
      navigate("/dashboard");
    } else if(user?.sellerStatus === "rejected"){
      navigate("/seller/rejected");
    }
  }, [user, navigate]);

  if( loading ) return <Loader />;

  return (
    <div className="seller-status-page">
      <div className="status-card pending">
        <div className="status-icon-wrapper pending-icon">
          <FiClock />
        </div>
        <h1>Application Under Review</h1>
        <p className="status-subtitle">
          Your seller application has been submitted and is currently being reviewed by our team.
        </p>
        <div className="status-timeline">
          <div className="timeline-step completed">
            <div className="step-circle">1</div>
            <span>Submitted</span>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step active">
            <div className="step-circle">2</div>
            <span>Under Review</span>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="step-circle">3</div>
            <span>Approved</span>
          </div>
        </div>
        <p className="status-hint">
          This process usually takes 24-48 hours. We'll notify you once a decision is made.
        </p>
      </div>
    </div>
  )
}

export default SellerPending;
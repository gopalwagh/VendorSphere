import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader.jsx";
import { fetchApprovedApplicationsThunk, rejectApplicationThunk } from "../../features/superAdmin/superAdminThunk.js";
import { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";

const ApprovedSellers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { approvedApplications, loading } = useSelector((state) => state.superAdmin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    dispatch(fetchApprovedApplicationsThunk());
  }, [dispatch]);

  const openRejectModal = (id) => {
    setSelectedAppId(id);
    setRejectReason("");
    setIsModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsModalOpen(false);
    setSelectedAppId(null);
    setRejectReason("");
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    const result = await dispatch(
      rejectApplicationThunk({
        id: selectedAppId,
        reason: rejectReason,
      })
    );

    if (result.success) {
      toast.success("Seller Rejected Successfully");
      closeRejectModal();
      dispatch(fetchApprovedApplicationsThunk()); // Refresh list
    } else {
      toast.error(result.message || "Failed to reject seller");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <h1>Approved Sellers <span className="count-badge">{approvedApplications.length}</span></h1>
      </div>

      {approvedApplications.length === 0 ? (
        <div className="empty-state">
          <FiCheckCircle className="empty-state-icon" />
          <h3>No Approved Sellers</h3>
          <p>There are currently no approved sellers on the platform.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Owner</th>
                <th>Contact</th>
                <th>Compliance (GST/PAN)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedApplications.map((seller) => (
                <tr key={seller._id}>
                  <td>
                    <strong>{seller.storeName}</strong>
                  </td>
                  <td>
                    {seller.user?.name}
                    <br />
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{seller.user?.email}</span>
                  </td>
                  <td>
                    {seller.phone}
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem" }}>GST: {seller.gstNumber}</span>
                    <br />
                    <span style={{ fontSize: "0.85rem" }}>PAN: {seller.panNumber}</span>
                  </td>
                  <td>
                    <span className="status-badge approved">Approved</span>
                  </td>
                  <td>
                    <button
                      className="action-btn reject"
                      onClick={() => openRejectModal(seller._id)}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Revoke Approval</h2>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label>Reason for Revocation *</label>
                  <textarea
                    rows="4"
                    placeholder="Explain why this seller's approval is being revoked..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn danger">
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedSellers;

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { approveApplicationThunk, fetchPendingApplicationThunk, rejectApplicationThunk } from "../../features/superAdmin/superAdminThunk";
import Loader from "../../components/Loader/Loader";
import toast from "react-hot-toast";
import { FiInbox } from "react-icons/fi";

const SellerApplications = () => {
  const dispatch = useDispatch();
  const { pendingApplications, loading } = useSelector((state) => state.superAdmin);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    dispatch(fetchPendingApplicationThunk());
  }, [dispatch]);

  const handleApprove = async (id) => {
    const result = await dispatch(approveApplicationThunk(id));
    if (result.success) {
      toast.success("Seller Approved Successfully");
      dispatch(fetchPendingApplicationThunk());
    } else {
      toast.error(result.message || "Failed to approve seller");
    }
  };

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
      toast.success("Seller Rejected");
      closeRejectModal();
      dispatch(fetchPendingApplicationThunk());
    } else {
      toast.error(result.message || "Failed to reject seller");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <h1>Pending Applications <span className="count-badge">{pendingApplications.length}</span></h1>
      </div>

      {pendingApplications.length === 0 ? (
        <div className="empty-state">
          <FiInbox className="empty-state-icon" />
          <h3>No Pending Applications</h3>
          <p>All seller applications have been reviewed.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Store Details</th>
                <th>Owner Info</th>
                <th>GST & PAN</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApplications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.storeName}</strong>
                    <br />
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{app.phone}</span>
                  </td>
                  <td>
                    {app.user?.name}
                    <br />
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{app.user?.email}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem" }}>GST: {app.gstNumber}</span>
                    <br />
                    <span style={{ fontSize: "0.85rem" }}>PAN: {app.panNumber}</span>
                  </td>
                  <td>
                    <span className="status-badge pending">Pending</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className="action-btn approve"
                        onClick={() => handleApprove(app._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="action-btn reject"
                        onClick={() => openRejectModal(app._id)}
                      >
                        Reject
                      </button>
                    </div>
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
              <h2>Reject Application</h2>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label>Reason for Rejection *</label>
                  <textarea
                    rows="4"
                    placeholder="Explain why this application is being rejected..."
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
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApplications;

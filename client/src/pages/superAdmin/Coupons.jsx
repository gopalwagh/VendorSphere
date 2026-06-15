import './Coupons.css';
import toast from "react-hot-toast";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCouponsThunk, createCouponThunk, deleteCouponThunk } from "../../features/coupon/couponThunk.js";
import Loader from '../../components/Loader/Loader.jsx';
import { FiTag, FiPlus, FiTrash2, FiCalendar, FiDollarSign } from 'react-icons/fi';

const Coupons = () => {
  const dispatch = useDispatch();
  const { allCoupons, loading } = useSelector((state) => state.coupon);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    expiresAt: "",
    minimumAmount: "",
  });

  useEffect(() => {
    dispatch(fetchAllCouponsThunk());
  }, [dispatch]);

  const handleCreateCoupons = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(createCouponThunk(formData));
      if (result.success) {
        toast.success("Coupon created successfully!");
        setShowCreateForm(false);
        setFormData({ 
          code: "",
          discountPercent: "", 
          expiresAt: "", 
          minimumAmount: "" 
        });
      } else {
        toast.error(result.message || "Failed to create coupon");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      const result = await dispatch(deleteCouponThunk(id));
      if (result.success) {
        toast.success("Coupon deleted");
      } else {
        toast.error(result.message || "Failed to delete coupon");
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <h1>Coupons <span className="count-badge">{allCoupons.length}</span></h1>
        <button 
          className="action-btn primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowCreateForm(true)}
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Create New Coupon</h2>
            </div>
            <form onSubmit={handleCreateCoupons}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label>Coupon Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SUMMER50" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label>Discount Percentage (%) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 15" 
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label>Valid For (Number of Days) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 30" 
                    min="1"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label>Minimum Purchase Amount (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1000" 
                    min="0"
                    value={formData.minimumAmount}
                    onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="modal-btn-cancel" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {allCoupons.length === 0 ? (
        <div className="empty-state">
          <FiTag className="empty-state-icon" />
          <h3>No Coupons Found</h3>
          <p>Create your first discount coupon to attract more customers.</p>
          <button 
            className="action-btn primary"
            style={{ marginTop: '16px' }}
            onClick={() => setShowCreateForm(true)}
          >
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="coupon-grid">
          {allCoupons.map((coupon) => (
            <div key={coupon._id} className="coupon-card">
              <div className="coupon-card-header">
                <div className="coupon-code-badge">
                  <FiTag /> {coupon.code}
                </div>
                <button 
                  className="coupon-delete-btn"
                  onClick={() => handleDelete(coupon._id)}
                  title="Delete Coupon"
                >
                  <FiTrash2 />
                </button>
              </div>
              
              <div className="coupon-discount-display">
                <span className="discount-value">{coupon.discountPercent}%</span>
                <span className="discount-label">OFF</span>
              </div>

              <div className="coupon-details">
                <div className="coupon-detail-item">
                  <FiDollarSign className="detail-icon" />
                  <span>Min. Order: <strong>₹{coupon.minimumAmount}</strong></span>
                </div>
                <div className="coupon-detail-item">
                  <FiCalendar className="detail-icon" />
                  <span>Expires: <strong>{new Date(coupon.expiresAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
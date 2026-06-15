import { useForm } from "react-hook-form";
import "./Application.css";
import toast from "react-hot-toast";
import { applySellerProfileThunk } from "../../features/seller/sellerThunk";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { useState } from "react";
import { FiUploadCloud, FiInfo, FiFileText, FiDollarSign } from "react-icons/fi";

const SellerApplication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.seller);
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  // Watch for file changes to show preview
  const logoFile = watch("storeLogo");
  
  if (logoFile && logoFile.length > 0 && !logoPreview) {
    const file = logoFile[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "storeLogo") {
        if (value && value.length > 0) {
          formData.append("storeLogo", value[0]);
        }
      } else {
        formData.append(key, value);
      }
    });

    const result = await dispatch(applySellerProfileThunk(formData));

    if (result.success) {
      toast.success("Application Submitted Successfully");
      navigate("/seller/pending");
    } else {
      toast.error(result.message || "Failed to submit application");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="store-form-page">
      <div className="store-form-wrapper">
        <div className="store-form-header">
          <h1>Become a Seller</h1>
          <p>Fill out the application below to start selling on our platform.</p>
        </div>

        <form className="store-form" onSubmit={handleSubmit(onSubmit)}>
          {/* SECTION: Store Info */}
          <div className="form-section">
            <h3 className="section-title">
              <FiInfo className="section-icon" /> Store Information
            </h3>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>Store Name *</label>
                <input
                  type="text"
                  placeholder="Enter your store name"
                  {...register("storeName", { required: "Store name is required" })}
                  className={errors.storeName ? "input-error" : ""}
                />
                {errors.storeName && <span className="error-message">{errors.storeName.message}</span>}
              </div>

              <div className="input-group full-width">
                <label>Store Description</label>
                <textarea
                  placeholder="Briefly describe what you sell"
                  {...register("storeDescription")}
                  rows="3"
                />
              </div>

              <div className="input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Must be a valid 10-digit number",
                    },
                  })}
                  className={errors.phone ? "input-error" : ""}
                />
                {errors.phone && <span className="error-message">{errors.phone.message}</span>}
              </div>

              <div className="input-group full-width">
                <label>Business Address *</label>
                <textarea
                  placeholder="Complete business address"
                  {...register("address", { required: "Address is required" })}
                  rows="2"
                  className={errors.address ? "input-error" : ""}
                />
                {errors.address && <span className="error-message">{errors.address.message}</span>}
              </div>
            </div>
          </div>

          {/* SECTION: Compliance */}
          <div className="form-section">
            <h3 className="section-title">
              <FiFileText className="section-icon" /> Tax & Compliance
            </h3>
            <div className="form-grid">
              <div className="input-group">
                <label>GST Number *</label>
                <input
                  type="text"
                  placeholder="15-character GSTIN"
                  {...register("gstNumber", {
                    required: "GST Number is required",
                    pattern: {
                      value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                      message: "Invalid GST Number format",
                    },
                  })}
                  className={errors.gstNumber ? "input-error" : ""}
                />
                {errors.gstNumber && <span className="error-message">{errors.gstNumber.message}</span>}
              </div>

              <div className="input-group">
                <label>PAN Number *</label>
                <input
                  type="text"
                  placeholder="10-character PAN"
                  {...register("panNumber", {
                    required: "PAN Number is required",
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: "Invalid PAN format (e.g. ABCDE1234F)",
                    },
                  })}
                  className={errors.panNumber ? "input-error" : ""}
                />
                {errors.panNumber && <span className="error-message">{errors.panNumber.message}</span>}
              </div>
            </div>
          </div>

          {/* SECTION: Banking */}
          <div className="form-section">
            <h3 className="section-title">
              <FiDollarSign className="section-icon" /> Banking Details
            </h3>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>Bank Name *</label>
                <input
                  type="text"
                  placeholder="Name of your bank"
                  {...register("bankName", { required: "Bank name is required" })}
                  className={errors.bankName ? "input-error" : ""}
                />
                {errors.bankName && <span className="error-message">{errors.bankName.message}</span>}
              </div>

              <div className="input-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  placeholder="Bank account number"
                  {...register("accountNumber", {
                    required: "Account number is required",
                    pattern: {
                      value: /^\d{9,18}$/,
                      message: "Invalid account number",
                    },
                  })}
                  className={errors.accountNumber ? "input-error" : ""}
                />
                {errors.accountNumber && <span className="error-message">{errors.accountNumber.message}</span>}
              </div>

              <div className="input-group">
                <label>IFSC Code *</label>
                <input
                  type="text"
                  placeholder="11-character IFSC code"
                  {...register("ifscCode", {
                    required: "IFSC code is required",
                    pattern: {
                      value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                      message: "Invalid IFSC format",
                    },
                  })}
                  className={errors.ifscCode ? "input-error" : ""}
                />
                {errors.ifscCode && <span className="error-message">{errors.ifscCode.message}</span>}
              </div>
            </div>
          </div>

          {/* SECTION: Store Logo */}
          <div className="form-section">
            <h3 className="section-title">Store Logo</h3>
            <div className="file-upload-box">
              {logoPreview ? (
                <div className="preview-container">
                  <img src={logoPreview} alt="Logo Preview" className="logo-preview" />
                  <button type="button" onClick={() => setLogoPreview(null)} className="remove-preview-btn">
                    Change Logo
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <FiUploadCloud className="upload-icon" />
                  <span className="upload-text">Click to upload store logo</span>
                  <span className="upload-hint">PNG, JPG up to 2MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("storeLogo")}
                    className="hidden-file-input"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerApplication;
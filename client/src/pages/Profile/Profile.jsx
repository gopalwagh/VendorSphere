import "./Profile.css";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import { updateUserProfileThunk } from "../../features/auth/authThunk";
import { ROLES, getRoleLabel, normalizeRole } from "../../features/auth/roleUtils";
import { fetchSellerProfileThunk, updateSellerProfileThunk } from "../../features/superAdmin/superAdminThunk.js";
import {
  FiBriefcase,
  FiCheckCircle,
  FiMapPin,
  FiSave,
  FiShield,
  FiUploadCloud,
  FiUser,
} from "react-icons/fi";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sellerProfile, loading: sellerLoading } = useSelector((state) => state.superAdmin);
  const normalizedRole = normalizeRole(user?.role);
  const isSeller = normalizedRole === ROLES.SELLER;

  const [savingUser, setSavingUser] = useState(false);
  const [savingSeller, setSavingSeller] = useState(false);
  const [sellerLogoPreview, setSellerLogoPreview] = useState(null);

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    reset: resetUser,
  } = useForm();

  const {
    register: registerSeller,
    handleSubmit: handleSellerSubmit,
    reset: resetSeller,
    watch: watchSeller,
  } = useForm();

  useEffect(() => {
    if (isSeller && !sellerProfile) {
      dispatch(fetchSellerProfileThunk());
    }
  }, [dispatch, isSeller, sellerProfile, sellerLoading]);

  useEffect(() => {
    if (!user) return;

    const firstAddress = user.addresses?.[0] || {};
    resetUser({
      name: user.name || "",
      phone: user.phone || "",
      addressLine1: firstAddress.addressLine1 || "",
      addressLine2: firstAddress.addressLine2 || "",
      city: firstAddress.city || "",
      state: firstAddress.state || "",
      postalCode: firstAddress.postalCode || "",
      country: firstAddress.country || "",
    });
  }, [user, resetUser]);

  useEffect(() => {
    if (!sellerProfile) return;

    resetSeller({
      storeName: sellerProfile.storeName || "",
      storeDescription: sellerProfile.storeDescription || "",
      phone: sellerProfile.phone || "",
      address: sellerProfile.address || "",
      gstNumber: sellerProfile.gstNumber || "",
      panNumber: sellerProfile.panNumber || "",
      bankName: sellerProfile.bankName || "",
      accountNumber: sellerProfile.accountNumber || "",
      ifscCode: sellerProfile.ifscCode || "",
    });

    if (sellerProfile.storeLogo?.url) {
      setSellerLogoPreview(sellerProfile.storeLogo.url);
    }
  }, [sellerProfile, resetSeller]);

  const sellerLogoFile = watchSeller("storeLogo");

  useEffect(() => {
    if (sellerLogoFile?.length > 0) {
      const nextPreview = URL.createObjectURL(sellerLogoFile[0]);
      setSellerLogoPreview(nextPreview);
      return () => URL.revokeObjectURL(nextPreview);
    }

    if (sellerProfile?.storeLogo?.url) {
      setSellerLogoPreview(sellerProfile.storeLogo.url);
      return undefined;
    }

    setSellerLogoPreview(null);
    return undefined;
  }, [sellerLogoFile, sellerProfile]);

  const handleUserProfileSave = async (data) => {
    setSavingUser(true);
    try {
      const address = {
        fullName: data.name,
        phoneNumber: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      };

      const hasAddressData = Object.values(address).some((value) => Boolean(String(value || "").trim()));

      const result = await dispatch(
        updateUserProfileThunk({
          name: data.name,
          phone: data.phone,
          addresses: hasAddressData ? [address] : [],
        })
      );

      if (result.success) {
        toast.success("Personal profile updated");
      } else {
        toast.error(result.message || "Failed to update personal profile");
      }
    } finally {
      setSavingUser(false);
    }
  };

  const handleSellerProfileSave = async (data) => {
    setSavingSeller(true);

    try {
      const formData = new FormData();
      formData.append("storeName", data.storeName);
      formData.append("storeDescription", data.storeDescription);
      formData.append("phone", data.phone);
      formData.append("address", data.address);
      formData.append("gstNumber", data.gstNumber);
      formData.append("panNumber", data.panNumber);
      formData.append("bankName", data.bankName);
      formData.append("accountNumber", data.accountNumber);
      formData.append("ifscCode", data.ifscCode);

      if (data.storeLogo?.length > 0) {
        formData.append("storeLogo", data.storeLogo[0]);
      }

      const result = await dispatch(updateSellerProfileThunk(formData));

      if (result.success) {
        toast.success("Seller profile updated");
      } else {
        toast.error(result.message || "Failed to update seller profile");
      }
    } finally {
      setSavingSeller(false);
    }
  };

  if (!user) {
    return <Loader />;
  }

  if (sellerLoading && isSeller && !sellerProfile) {
    return <Loader />;
  }

  const sellerStatus = sellerProfile?.applicationStatus || user?.sellerStatus;

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div>
          <span className="hero-kicker">Profile</span>
          <h1>{isSeller ? "Seller and account profile" : "Account profile"}</h1>
          <p>
            Keep your details current so orders, notifications, and seller information stay accurate.
          </p>
        </div>

        <div className="profile-chip-panel">
          <div className="profile-chip">
            <FiUser />
            <div>
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>
          </div>
          <div className="profile-chip">
            <FiShield />
            <div>
              <span>Role</span>
              <strong>{getRoleLabel(normalizedRole)}</strong>
            </div>
          </div>
          {isSeller && (
            <div className="profile-chip">
              <FiCheckCircle />
              <div>
                <span>Seller status</span>
                <strong>{sellerStatus || "not_applied"}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-card">
          <div className="profile-card-header">
            <div>
              <span className="profile-kicker">Personal</span>
              <h2>Account details</h2>
            </div>
            <FiMapPin className="profile-card-icon" />
          </div>

          <form className="profile-form" onSubmit={handleUserSubmit(handleUserProfileSave)}>
            <div className="field-grid">
              <div className="field-group full">
                <label>Name</label>
                <input type="text" {...registerUser("name")} />
              </div>

              <div className="field-group full">
                <label>Phone</label>
                <input type="tel" {...registerUser("phone")} placeholder="10-digit phone number" />
              </div>

              <div className="field-group">
                <label>Address line 1</label>
                <input type="text" {...registerUser("addressLine1")} placeholder="Street address" />
              </div>

              <div className="field-group">
                <label>Address line 2</label>
                <input type="text" {...registerUser("addressLine2")} placeholder="Apartment, suite, landmark" />
              </div>

              <div className="field-group">
                <label>City</label>
                <input type="text" {...registerUser("city")} />
              </div>

              <div className="field-group">
                <label>State</label>
                <input type="text" {...registerUser("state")} />
              </div>

              <div className="field-group">
                <label>Postal code</label>
                <input type="text" {...registerUser("postalCode")} />
              </div>

              <div className="field-group">
                <label>Country</label>
                <input type="text" {...registerUser("country")} />
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={savingUser}>
              <FiSave />
              {savingUser ? "Saving..." : "Save personal profile"}
            </button>
          </form>
        </section>

        {isSeller && (
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <span className="profile-kicker">Seller</span>
                <h2>Business profile</h2>
              </div>
              <FiBriefcase className="profile-card-icon" />
            </div>

            <div className={`seller-status-banner ${sellerStatus || "not_applied"}`}>
              <strong>{sellerStatus || "not_applied"}</strong>
              <span>
                {sellerStatus === "approved"
                  ? "Your seller profile is active in the dashboard."
                  : sellerStatus === "pending"
                    ? "Your profile is currently under review."
                    : sellerStatus === "rejected"
                      ? sellerProfile?.rejectionReason || "This seller profile was rejected."
                      : "Complete or submit your seller application from the seller status page."}
              </span>
            </div>

            <form className="profile-form" onSubmit={handleSellerSubmit(handleSellerProfileSave)}>
              <div className="seller-logo-card">
                {sellerLogoPreview ? (
                  <img src={sellerLogoPreview} alt="Seller logo preview" />
                ) : (
                  <div className="seller-logo-fallback">
                    {sellerProfile?.storeName?.slice(0, 1)?.toUpperCase() || "S"}
                  </div>
                )}

                <label className="logo-upload-btn">
                  <FiUploadCloud />
                  <span>Choose store logo</span>
                  <input type="file" accept="image/*" {...registerSeller("storeLogo")} />
                </label>
              </div>

              <div className="field-grid">
                <div className="field-group full">
                  <label>Store name</label>
                  <input type="text" {...registerSeller("storeName")} />
                </div>

                <div className="field-group full">
                  <label>Store description</label>
                  <textarea rows="4" {...registerSeller("storeDescription")} />
                </div>

                <div className="field-group">
                  <label>Phone</label>
                  <input type="text" {...registerSeller("phone")} />
                </div>

                <div className="field-group">
                  <label>Business address</label>
                  <input type="text" {...registerSeller("address")} />
                </div>

                <div className="field-group">
                  <label>GST number</label>
                  <input type="text" {...registerSeller("gstNumber")} />
                </div>

                <div className="field-group">
                  <label>PAN number</label>
                  <input type="text" {...registerSeller("panNumber")} />
                </div>

                <div className="field-group">
                  <label>Bank name</label>
                  <input type="text" {...registerSeller("bankName")} />
                </div>

                <div className="field-group">
                  <label>Account number</label>
                  <input type="text" {...registerSeller("accountNumber")} />
                </div>

                <div className="field-group full">
                  <label>IFSC code</label>
                  <input type="text" {...registerSeller("ifscCode")} />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={savingSeller}>
                <FiSave />
                {savingSeller ? "Saving..." : "Save seller profile"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

export default Profile;

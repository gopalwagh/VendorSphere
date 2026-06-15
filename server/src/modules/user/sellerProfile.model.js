import mongoose from "mongoose";

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
    },

    storeDescription: {
      type: String,
      required: true,
    },

    storeLogo: {
      public_id: String,
      url: String,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    gstNumber: {
      type: String,
      required: true,
    },

    panNumber: {
      type: String,
      required: true,
    },

    bankName: {
      type: String,
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
    },

    ifscCode: {
      type: String,
      required: true,
    },

    applicationStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: String,
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SellerProfile", sellerProfileSchema);

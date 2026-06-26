import mongoose from "mongoose";
import {
  SELLER_ROLE,
  SUPER_ADMIN_ROLE,
  USER_ROLE,
} from "../../utils/roleUtils.js";

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phoneNumber: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },

  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      public_id: String,
      url: String,
    },

    role: {
      type: String,
      enum: [USER_ROLE, SELLER_ROLE, SUPER_ADMIN_ROLE],
      default: USER_ROLE,
    },
    
    sellerStatus: {
      type: String,
      enum: [
        "not_applied",
        "pending",
        "approved",
        "rejected"
      ],
      default: "not_applied"
    },

    refreshToken: {
      type: String,
    },

    phone: {
      type: String,
    },

    addresses: [addressSchema],
    
    fcmToken: {
      type: String,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model(
  "User",
  userSchema
);

import mongoose from "mongoose";

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
      enum: ["user", "admin", "superAdmin"],
      default: "user",
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
  },

  {
    timestamps: true,
  }
);

export default mongoose.model(
  "User",
  userSchema
);
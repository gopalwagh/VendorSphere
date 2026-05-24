import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code : {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discountPercent: {
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minimumAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps : true, }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
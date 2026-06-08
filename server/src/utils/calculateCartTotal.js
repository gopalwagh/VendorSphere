import Coupon from "../modules/coupon/coupon.model.js";
import ApiError from "./ApiError.js";

const calculateCartTotal = async(subtotal,couponCode = null) => {
  const shipping = subtotal > 0 ? 100 : 0;
  const tax = subtotal * 0.05;

  let discountAmount = 0;
  let discountPercent = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
    });

    if (!coupon) {
      throw new ApiError(400, "Invalid coupon");
    }

    if (!coupon.isActive) {
      throw new ApiError(400, "Coupon inactive");
    }

    if (new Date() > coupon.expiresAt) {
      throw new ApiError(400, "Coupon expired");
    }

    if (subtotal < coupon.minimumAmount) {
      throw new ApiError(
        400,
        `Minimum cart amount is Rs. ${coupon.minimumAmount}`
      );
    }

    discountPercent = coupon.discountPercent;

    discountAmount =
      Number((subtotal * discountPercent) / 100).toFixed(2);
  }
  const finalAmount = Number(subtotal + shipping + tax - discountAmount).toFixed(2);

  return {
    shipping,
    tax,
    discountPercent,
    discountAmount,
    finalAmount,
  };
}
export default calculateCartTotal;
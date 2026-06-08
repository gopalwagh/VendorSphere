import Coupon from "./coupon.model.js";

import Cart from "../cart/cart.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import calculateCartTotal from "../../utils/calculateCartTotal.js";

export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountPercent,
    expiresAt,
    minimumAmount,
  } = req.body;

  const exisitingCoupon = await Coupon.findOne({ code });
  if (exisitingCoupon) {
    throw new ApiError(400, "Coupon already exists");
  }

  const coupon = await Coupon.create({
    code,
    discountPercent,
    expiresAt : new Date(Date.now() + expiresAt * 24 * 60 * 60 * 1000),
    minimumAmount,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      coupon,
      "Coupon created"
    )
  );
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  if (!couponCode) {
    throw new ApiError(400, "Coupon code is required");
  }

  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate({
    path: "items.product",
    select: "price",
  });

  if (!cart.items.length) {
    throw new ApiError(400, "Cart is empty");
  }

  const subtotal = cart.items.reduce(
    (sum, item) =>
      sum + ((item.product?.price || 0) * item.quantity),
    0
  );

  const { shipping, tax, discountPercent, discountAmount, finalAmount, } = await calculateCartTotal(subtotal,couponCode);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        couponCode,
        subtotal,
        shipping,
        tax,
        discountPercent,
        discountAmount,
        grandTotal: finalAmount,
      },
      "Coupon applied"
    )
  );
});

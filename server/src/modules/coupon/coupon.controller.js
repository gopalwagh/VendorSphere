import Coupon from "./coupon.model.js";

import Cart from "../cart/cart.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

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
  
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon");
  }

  if (!coupon.isActive) {
    throw new ApiError(400, "Coupon inactive");
  }

  if (new Date() > coupon.expiresAt) {
    throw new ApiError(400, "Coupon expired");
  }

  const subtotal = cart.items.reduce(
    (sum, item) =>
      sum + ((item.product?.price || 0) * item.quantity),
    0
  );

  const shipping = subtotal > 0 ? 100 : 0;
  const tax = Number((subtotal * 0.05).toFixed(2));

  if (subtotal < coupon.minimumAmount) {
    throw new ApiError(
      400,
      `Minimum cart amount is Rs. ${coupon.minimumAmount}`
    );
  }

  const discountAmount =
    Number((subtotal * coupon.discountPercent) / 100).toFixed(2);
  const grandTotal = Number(subtotal + shipping + tax - discountAmount).toFixed(2);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subtotal,
        shipping,
        tax,
        discountPercent: coupon.discountPercent,
        discountAmount,
        grandTotal,
      },
      "Coupon applied"
    )
  );
});

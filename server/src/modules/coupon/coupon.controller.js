import Coupon from "./coupon.model.js";

import Cart from "../cart/cart.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const createCoupon = asyncHandler(async(req, res) => {
  const { code, discountPercent, expiresAt, minimumAmount } = req.body;

  const exisitingCoupon = await Coupon.findOne({ code, });
  if(exisitingCoupon){
    throw new ApiError(400,"Coupon already exists");
  }

  const coupon = await Coupon.create({
    code,
    discountPercent,
    expiresAt,
    minimumAmount,
  });

  return res.status(200).json(
    new ApiResponse(
      201,
      coupon,
      "Coupon Created"
    )
  );
});

export const applyCoupon = asyncHandler(async(req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({
    user: req.user._id,
  });
  if(!cart){
    throw new ApiError(404,"Cart not found");
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
  });
  if(!coupon){
    throw new ApiError(404,"Invalid Coupon");
  }

  // Inactive Coupon
  if(!coupon.isActive){
    throw new ApiError(404,"Coupon Inactive");
  }
  // expired Coupon
  if( new Date() > coupon.expiresAt ){
    throw new ApiError(400,"Coupon expired");   
  }
  // minimum amount check
  if(cart.totalPrice < coupon.minimumAmount){
    throw new ApiError(400, `Minimum cart amount is ₹${coupon.minimumAmount}`)
  }
  // discount calculation
  const discountAmount = (cart.totalPrice* coupon.discountPercent)/100;

  const finalPrice = cart.totalPrice - discountAmount;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        originalPrice : cart.totalPrice,
        discountPercent : cart.discountPercent,
        discountAmount,
        finalPrice,
      },
      "Coupon applied"
    )
  );
});
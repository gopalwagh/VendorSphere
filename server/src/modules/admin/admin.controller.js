import mongoose from "mongoose";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Product from "../product/product.model.js";
import Order from "../order/order.model.js";
import { getAnalyticsService } from "./admin.service.js";

export const getAnalytics = asyncHandler(async(req,res)=>{
  const analytics = await getAnalyticsService(
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      analytics,
      "Analytics fetched"
    )
  );
});
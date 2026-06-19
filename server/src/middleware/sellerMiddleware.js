import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isSellerRole } from "../utils/roleUtils.js";

const sellerOnly = asyncHandler(async (req, res, next) => {
  if (!isSellerRole(req.user.role)) {
    throw new ApiError(403, "Seller access only");
  }

  next();
});

export default sellerOnly;

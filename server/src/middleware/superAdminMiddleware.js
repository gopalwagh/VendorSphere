import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const superAdminOnly = asyncHandler(async (req, res, next) => {
  if(req.user.role !== "superAdmin") {
    throw new ApiError(403,"Access Denied");
  }

  next();

});

export default superAdminOnly;
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { SUPER_ADMIN_ROLE, normalizeRole } from "../utils/roleUtils.js";

const superAdminOnly = asyncHandler(async (req, res, next) => {
  if (normalizeRole(req.user.role) !== SUPER_ADMIN_ROLE) {
    throw new ApiError(403,"Access Denied");
  }

  next();

});

export default superAdminOnly;

import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../modules/user/user.model.js";
import { normalizeRole } from "../utils/roleUtils.js";

const protect = asyncHandler(async (req, res, next) => {

  const token = req.cookies.accessToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized access");
  }

  const decodedToken = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decodedToken.userId).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  user.role = normalizeRole(user.role);

  req.user = user;

  next();
});

export default protect;

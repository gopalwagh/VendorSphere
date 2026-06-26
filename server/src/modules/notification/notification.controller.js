import User from "../user/user.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import { sendPushNotification } from "./notification.service.js";
import { log } from "console";

export const saveFcmToken = asyncHandler(async(req,res) => {
  const { token } = req.body;
  if(!token){
    throw new ApiError(400,"FCM token required");
  }
  await User.findByIdAndUpdate(
    req.user._id,
    {
      fcmToken: token,
    }
  );
  
  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "FCM token saved"
    )
  );
})
// this is made jsut for testign purpose
export const testNotification = asyncHandler(async(req, res) => {
  const user = await User.findById(
    req.user._id
  );
  
  await sendPushNotification(
    req.user._id,
    user.fcmToken,
    "VendorSphere",
    "FCM is working 🚀"
  );

  return res.json({
    success: true,
  });
});

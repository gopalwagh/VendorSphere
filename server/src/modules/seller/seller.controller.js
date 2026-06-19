import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import User from "../user/user.model.js";
import SellerProfile from "../user/sellerProfile.model.js";
import { getAnalyticsService } from "./seller.service.js";
import { getCachedData, setCachedData } from "../../utils/redisHelper.js";

export const applySellerProfile = asyncHandler(async(req,res) =>  {
  const { 
    storeName, storeDescription, 
    phone, address, gstNumber, 
    panNumber, bankName, 
    accountNumber, ifscCode, 
  } = req.body;
  // validation karenge ab
  if (!storeName || !storeDescription || 
    !phone || !address || !gstNumber || 
    !panNumber || !bankName || 
    !accountNumber || !ifscCode ) { 
    throw new ApiError( 400, "All fields are required" ); 
  }

  const existingProfile = await SellerProfile.findOne({ user: req.user._id });

  let sellerProfile;

  let storeLogo = existingProfile?.storeLogo || {};
  if (req.file) {
    if (existingProfile?.storeLogo?.public_id) {
      try {
        await cloudinary.uploader.destroy(existingProfile.storeLogo.public_id);
      } catch (error) {
        console.error("Failed to remove old seller logo:", error.message);
      }
    }

    const uploadedImage = await uploadToCloudinary(req.file.buffer,"seller-logos");
  
    storeLogo = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    };
  } else if (!existingProfile) {
    throw new ApiError(400, "Store logo is required");
  }

  if(existingProfile && existingProfile.applicationStatus!=="rejected") {
    throw new ApiError(400, "Application already Exist")
  }  

  if( existingProfile && existingProfile.applicationStatus === "rejected" ){
    existingProfile.storeName = storeName;
    existingProfile.storeDescription = storeDescription;
    existingProfile.storeLogo = storeLogo;
    existingProfile.phone = phone;
    existingProfile.address = address;
    existingProfile.gstNumber = gstNumber;
    existingProfile.panNumber = panNumber;
    existingProfile.bankName = bankName;
    existingProfile.accountNumber = accountNumber;
    existingProfile.ifscCode = ifscCode;
    existingProfile.applicationStatus = "pending";

    sellerProfile = await existingProfile.save();
  }
  
  if(!existingProfile){
    sellerProfile = await SellerProfile.create({
      user: req.user._id,
      storeName, 
      storeDescription, 
      storeLogo,
      phone, 
      address, 
      gstNumber, 
      panNumber, 
      bankName, 
      accountNumber, 
      ifscCode, 
      applicationStatus: "pending",
    });
  }
  
  await User.findByIdAndUpdate(req.user._id, {
    sellerStatus: "pending",
  });
  
    return res.status(201).json(
      new ApiResponse(
        201,
        sellerProfile,
        "Seller application submitted successfully"
      )
    );
  }
);

export const getSellerProfile = asyncHandler(async (req,res) => {
  const sellerProfile = await SellerProfile.findOne({
    user: req.user._id,
  })
  .populate("user", "name email role sellerStatus phone avatar addresses")
  .populate("approvedBy", "name email");

  return res.status(200).json(
    new ApiResponse(
      200,
      sellerProfile,
      "Seller Profile fetched"
    )
  );
});

export const updateSellerProfile = asyncHandler(async (req, res) => {
  const { storeName, storeDescription, phone, address, gstNumber, panNumber, bankName, accountNumber, ifscCode } = req.body;
  
  const existingProfile = await SellerProfile.findOne({ user: req.user._id });
  
  if (!existingProfile) {
    throw new ApiError(404, "Seller profile not found");
  }

  if (storeName) existingProfile.storeName = storeName;
  if (storeDescription) existingProfile.storeDescription = storeDescription;
  if (phone) existingProfile.phone = phone;
  if (address) existingProfile.address = address;
  if (gstNumber) existingProfile.gstNumber = gstNumber;
  if (panNumber) existingProfile.panNumber = panNumber;
  if (bankName) existingProfile.bankName = bankName;
  if (accountNumber) existingProfile.accountNumber = accountNumber;
  if (ifscCode) existingProfile.ifscCode = ifscCode;

  if (req.file) {
    if (existingProfile.storeLogo?.public_id) {
      try {
        await cloudinary.uploader.destroy(existingProfile.storeLogo.public_id);
      } catch (error) {
        console.error("Failed to remove old store logo:", error.message);
      }
    }
    const uploadedImage = await uploadToCloudinary(req.file.buffer, "seller-logos");
    existingProfile.storeLogo = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    };
  }

  await existingProfile.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      existingProfile,
      "Seller profile updated successfully"
    )
  );
});

export const getAnalytics = asyncHandler(async(req,res)=>{
  const sellerId = req.user._id;
  const cacheKey = `seller:analytics:${sellerId}`;
  const cachedAnalytics = await getCachedData(cacheKey);

  if (cachedAnalytics) {
    return res.status(200).json(
      new ApiResponse(
        200, 
        cachedAnalytics, 
        "Analytics fetched from cache"
      )
    );
  }

  const analytics = await getAnalyticsService(
    sellerId
  );

  await setCachedData(cacheKey, analytics, 1800);

  return res.status(200).json(
    new ApiResponse(
      200,
      analytics,
      "Analytics fetched"
    )
  );
});

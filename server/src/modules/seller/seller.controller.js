import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

import SellerProfile from "../user/sellerProfile.model.js";
import User from "../user/user.model.js";
import Order from "../order/order.model.js";

export const applySellerProfile = asyncHandler(async(req,res) =>  {
  const { storeName, storeDescription, 
    phone, address, gstNumber, 
    panNumber, bankName, 
    accountNumber, ifscCode, } = req.body;
  // validation karenge ab
  if (!storeName || !storeDescription || 
    !phone || !address || !gstNumber || 
    !panNumber || !bankName || 
    !accountNumber || !ifscCode ) { 
    throw new ApiError( 400, "All fields are required" ); 
  }

  const existingProfile = await SellerProfile.findOne({ user: req.user._id, });

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
  
  await User.findByIdAndUpdate(
    req.user._id,{
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

export const getPendingApplications =
  asyncHandler(async (req, res) => {

    const applications =
      await SellerProfile.find({
        applicationStatus: "pending",
      })
      .populate(
        "user",
        "name email role"
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        applications,
        "Pending applications fetched"
      )
    );
});

export const approveApplication =
  asyncHandler(async (req, res) => {

    const sellerProfile = await SellerProfile.findById(
      req.params.sellerProfileId
    );

    if (!sellerProfile) {
      throw new ApiError(
        404,
        "Application not found"
      );
    }

    sellerProfile.applicationStatus = "approved";

    sellerProfile.approvedBy = req.user._id;

    sellerProfile.approvedAt = new Date();

    await sellerProfile.save();

    await User.findByIdAndUpdate(
      sellerProfile.user,
      {
        sellerStatus: "approved",
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        sellerProfile,
        "Application approved"
      )
    );
});

export const rejectApplication =
  asyncHandler(async (req, res) => {

    const { reason } = req.body;

    const sellerProfile = await SellerProfile.findById(
        req.params.sellerProfileId
      );

    if (!sellerProfile) {
      throw new ApiError(
        404,
        "Application not found"
      );
    }

    sellerProfile.applicationStatus = "rejected";

    sellerProfile.rejectionReason = reason;

    await sellerProfile.save();

    await User.findByIdAndUpdate(
      sellerProfile.user,
      {
        sellerStatus: "rejected",
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        sellerProfile,
        "Application rejected"
      )
    );
});

export const getApprovedApplications = asyncHandler(async(req,res) => {
  const applications = await SellerProfile.find({
    applicationStatus: "approved",
  }).populate(
    "user", "name email"
  ).sort({
    updatedAt: -1,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      applications,
      "Approved application fetched"
    )
  )
})

export const getAllUsers = asyncHandler( async(req,res) => {
  const users = await User.find({ role: "user" })
  .select("-password")
  .sort({
    createdAt:-1
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      users,
      "Users fetched"
    )
  )
});

export const getSuperAdminDashboard = asyncHandler(
  async (req, res) => {

    const [
      totalUsers,
      totalSellers,
      pendingApplications,
      sellerStatusStats,
      revenueChart,
      topCategories,
      topSellers,
    ] = await Promise.all([

      User.countDocuments(),

      User.countDocuments({
        role: "admin",
        sellerStatus: "approved",
      }),

      SellerProfile.countDocuments({
        applicationStatus: "pending",
      }),

      SellerProfile.aggregate([
        {
          $group: {
            _id: "$applicationStatus",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $unwind: "$orderItems",
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },

            revenue: {
              $sum:
              "$orderItems.commissionAmount",
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Order.aggregate([
        {
          $unwind: "$orderItems",
        },

        {
          $group: {
            _id:
            "$orderItems.productCategory",

            sold: {
              $sum:
              "$orderItems.quantity",
            },
          },
        },

        {
          $sort: {
            sold: -1,
          },
        },

        {
          $limit: 5,
        },
      ]),

      Order.aggregate([
        {
          $unwind: "$orderItems",
        },

        {
          $group: {

            _id:
            "$orderItems.seller",

            revenue: {
              $sum:
              "$orderItems.sellerAmount",
            },

            orders: {
              $sum:
              "$orderItems.quantity",
            },
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },

        {
          $limit: 5,
        },

        {
          $lookup: {
            from: "users",

            localField: "_id",

            foreignField: "_id",

            as: "seller",
          },
        },

        {
          $unwind: "$seller",
        },

        {
          $project: {
            sellerName:
            "$seller.name",

            revenue: 1,

            orders: 1,
          },
        },
      ]),
    ]);

    const platformRevenue =
      await Order.aggregate([
        {
          $unwind: "$orderItems",
        },

        {
          $group: {
            _id: null,

            total: {
              $sum:
              "$orderItems.commissionAmount",
            },
          },
        },
      ]);

    const summary = {

      totalUsers,

      totalSellers,

      pendingApplications,

      platformRevenue:
      platformRevenue[0]?.total || 0,
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          summary,
          revenueChart,
          sellerStatusStats,
          topCategories,
          topSellers,
        },
        "Super admin dashboard fetched"
      )
    );
  }
);

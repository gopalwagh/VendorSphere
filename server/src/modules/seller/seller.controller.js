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

  if(!req.file) {
    throw new ApiError(400, "product image required");
  }
   
  let storeLogo = {};
  if(req.file){
    const uploadedImage = await uploadToCloudinary(req.file.buffer,"seller-logos");
  
    storeLogo = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    }
  }

  const existingProfile = await SellerProfile.findOne({ user: req.user._id, });

  let sellerProfile;

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
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      sellerProfile,
      "Seller Profile fetched"
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
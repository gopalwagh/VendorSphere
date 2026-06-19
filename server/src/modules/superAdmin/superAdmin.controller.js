import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import {
  SELLER_ROLES,
  USER_ROLE,
} from "../../utils/roleUtils.js";

import SellerProfile from "../user/sellerProfile.model.js";
import User from "../user/user.model.js";
import Order from "../order/order.model.js";

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
  const users = await User.find({ role: USER_ROLE })
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
      recentPendingApplications,
      sellerStatusStats,
      revenueChart,
      topCategories,
      topSellers,
    ] = await Promise.all([

      User.countDocuments({role: 'user'}),

      User.countDocuments({
        role: { $in: SELLER_ROLES },
        sellerStatus: "approved",
      }),

      SellerProfile.countDocuments({
        applicationStatus: "pending",
      }),

      SellerProfile.find({
        applicationStatus: "pending",
      })
        .populate("user", "name email role")
        .sort({
          createdAt: -1,
        })
        .limit(5),

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
            // Category ke badle Product Title par group karo
            _id: { $ifNull: ["$orderItems.productTitle", "Unknown Product"] },
            revenue: {
              $sum: "$orderItems.commissionAmount", 
            },
            sold: {
              $sum: "$orderItems.quantity",
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
          $project: {
            _id: 0,
            name: "$_id", // Product ka naam seedha 'name' key mein chala gaya
            revenue: 1,
            sold: 1,
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
            sellerName:"$seller.name",
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
          recentPendingApplications,
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

import mongoose from "mongoose";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Product from "../product/product.model.js";
import Order from "../order/order.model.js";
import { getAnalyticsService } from "./admin.service.js";

const DEFAULT_CHART_DAYS = 30;
const DEFAULT_TOP_PRODUCTS_LIMIT = 5;

const getStartDate = (days) => {
  const parsedDays = Number(days) || DEFAULT_CHART_DAYS;
  const startDate = new Date();

  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (parsedDays - 1));

  return startDate;
};

const getVendorObjectId = (userId) =>
  new mongoose.Types.ObjectId(userId);

const buildVendorOrderItemsPipeline = (
  vendorId,
  matchStage = {}
) => {
  const pipeline = [];

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push(
    {
      $unwind: "$orderItems",
    },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $match: {
        "productDetails.createdBy": vendorId,
      },
    }
  );

  return pipeline;
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const vendorId = getVendorObjectId(req.user._id);

  const [
    totalProducts,
    vendorOrders,
    paidVendorOrders,
    revenueSummary,
    customerSummary,
  ] = await Promise.all([
    Product.countDocuments({
      createdBy: vendorId,
    }),
    Order.aggregate([
      ...buildVendorOrderItemsPipeline(vendorId),
      {
        $group: {
          _id: "$_id",
        },
      },
      {
        $count: "totalOrders",
      },
    ]),
    Order.aggregate([
      ...buildVendorOrderItemsPipeline(vendorId, {
        paymentStatus: "paid",
      }),
      {
        $group: {
          _id: "$_id",
        },
      },
      {
        $count: "paidOrders",
      },
    ]),
    Order.aggregate([
      ...buildVendorOrderItemsPipeline(vendorId, {
        paymentStatus: "paid",
      }),
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $multiply: [
                "$orderItems.quantity",
                "$orderItems.price",
              ],
            },
          },
        },
      },
    ]),
    Order.aggregate([
      ...buildVendorOrderItemsPipeline(vendorId, {
        paymentStatus: "paid",
      }),
      {
        $group: {
          _id: "$user",
        },
      },
      {
        $count: "totalCustomers",
      },
    ]),
  ]);

  const totalOrders = vendorOrders[0]?.totalOrders || 0;
  const paidOrders = paidVendorOrders[0]?.paidOrders || 0;
  const totalRevenue = revenueSummary[0]?.totalRevenue || 0;
  const totalCustomers =
    customerSummary[0]?.totalCustomers || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers: totalCustomers,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue,
        paidOrders,
      },
      "Vendor dashboard stats fetched"
    )
  );
});

export const getRevenueChart = asyncHandler(async (req, res) => {
  const vendorId = getVendorObjectId(req.user._id);
  const startDate = getStartDate(req.query.days);

  const data = await Order.aggregate([
    ...buildVendorOrderItemsPipeline(vendorId, {
      paymentStatus: "paid",
      createdAt: {
        $gte: startDate,
      },
    }),
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        revenue: {
          $sum: {
            $multiply: [
              "$orderItems.quantity",
              "$orderItems.price",
            ],
          },
        },
        orders: {
          $addToSet: "$_id",
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: 1,
        orders: {
          $size: "$orders",
        },
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      data,
      "Vendor revenue chart data"
    )
  );
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const vendorId = getVendorObjectId(req.user._id);
  const limit = Number(req.query.limit) || DEFAULT_TOP_PRODUCTS_LIMIT;

  const data = await Order.aggregate([
    ...buildVendorOrderItemsPipeline(vendorId, {
      paymentStatus: "paid",
    }),
    {
      $group: {
        _id: "$orderItems.product",
        quantitySold: {
          $sum: "$orderItems.quantity",
        },
        revenue: {
          $sum: {
            $multiply: [
              "$orderItems.quantity",
              "$orderItems.price",
            ],
          },
        },
        title: {
          $first: "$productDetails.title",
        },
        category: {
          $first: "$productDetails.category",
        },
        images: {
          $first: "$productDetails.images",
        },
        stock: {
          $first: "$productDetails.stock",
        },
      },
    },
    {
      $sort: {
        quantitySold: -1,
        revenue: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        title: 1,
        category: 1,
        images: 1,
        stock: 1,
        quantitySold: 1,
        revenue: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      data,
      "Vendor top products fetched"
    )
  );
});

export const getUserGrowth = asyncHandler(async (req, res) => {
  const vendorId = getVendorObjectId(req.user._id);
  const startDate = getStartDate(req.query.days);

  const data = await Order.aggregate([
    ...buildVendorOrderItemsPipeline(vendorId, {
      paymentStatus: "paid",
    }),
    {
      $group: {
        _id: "$user",
        firstPurchaseAt: {
          $min: "$createdAt",
        },
      },
    },
    {
      $match: {
        firstPurchaseAt: {
          $gte: startDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$firstPurchaseAt",
          },
        },
        users: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        users: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      data,
      "Vendor customer growth data fetched"
    )
  );
});

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
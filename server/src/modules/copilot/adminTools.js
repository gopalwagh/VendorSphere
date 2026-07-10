import mongoose from "mongoose";
import Order from "../order/order.model.js";
import User from "../user/user.model.js";
import Coupon from "../coupon/coupon.model.js";
import { createBoundTool } from "./toolFactory.js";

const _platformRevenue = async () => {
  const now = new Date();
  const currentStart = new Date(now.getTime() - 30 * 86400000);
  const previousStart = new Date(now.getTime() - 60 * 86400000);

  const [result] = await Order.aggregate([
    { $match: { createdAt: { $gte: previousStart } } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: null,
        currentCommission: { $sum: { $cond: [{ $gte: ["$createdAt", currentStart] }, "$orderItems.commissionAmount", 0] } },
        previousCommission: { $sum: { $cond: [{ $lt: ["$createdAt", currentStart] }, "$orderItems.commissionAmount", 0] } },
        currentGMV: { $sum: { $cond: [{ $gte: ["$createdAt", currentStart] }, "$orderItems.price", 0] } },
      },
    },
  ]);
  return JSON.stringify(result || {});
};

const _sellerLeaderboard = async ({ sortBy = "revenue", limit = 10 }) => {
  const rows = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.seller",
        revenue: { $sum: "$orderItems.sellerAmount" },
        commissionGenerated: { $sum: "$orderItems.commissionAmount" },
        unitsSold: { $sum: "$orderItems.quantity" },
      },
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "seller" } },
    { $unwind: "$seller" },
    { $project: { sellerName: "$seller.name", revenue: 1, commissionGenerated: 1, unitsSold: 1 } },
    { $sort: sortBy === "commission" ? { commissionGenerated: -1 } : { revenue: -1 } },
    { $limit: limit },
  ]);
  return JSON.stringify(rows);
};

const _pendingSellerApplications = async () => {
  const rows = await User.find({ role: "seller", sellerStatus: "pending" })
    .select("name email createdAt")
    .lean();
  return JSON.stringify(rows);
};

const _couponEffectiveness = async ({ limit = 10 }) => {
  const rows = await Order.aggregate([
    { $match: { couponCode: { $ne: null, $exists: true } } },
    {
      $group: {
        _id: "$couponCode",
        timesUsed: { $sum: 1 },
        totalDiscountGiven: { $sum: "$discountAmount" },
        totalOrderValue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { timesUsed: -1 } },
    { $limit: limit },
  ]);
  return JSON.stringify(rows);
};

const _platformOrderStatusBreakdown = async () => {
  const rows = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);
  return JSON.stringify(rows);
};

const _platformTopProducts = async ({ sortBy = "revenue", limit = 10 }) => {
  const rows = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        title: { $first: "$orderItems.productTitle" },
        unitsSold: { $sum: "$orderItems.quantity" },
        revenue: { $sum: "$orderItems.price" },
      },
    },
    { $sort: sortBy === "units" ? { unitsSold: -1 } : { revenue: -1 } },
    { $limit: limit },
  ]);
  return JSON.stringify(rows);
};

export const buildAdminTools = (superAdmin) => [
  createBoundTool({
    name: "getPlatformRevenue",
    description: "Platform-wide commission earned and GMV, current 30 days vs previous 30 days.",
    parameters: { type: "object", properties: {}, required: [] },
    handler: _platformRevenue,
    boundContext: { superAdmin },
  }),
  createBoundTool({
    name: "getSellerLeaderboard",
    description: "Top sellers ranked by revenue or by commission they generated for the platform.",
    parameters: {
      type: "object",
      properties: { sortBy: { type: "string", enum: ["revenue", "commission"] }, limit: { type: "number" } },
      required: [],
    },
    handler: _sellerLeaderboard,
    boundContext: { superAdmin },
  }),
  createBoundTool({
    name: "getPendingSellerApplications",
    description: "Sellers whose store application is pending approval.",
    parameters: { type: "object", properties: {}, required: [] },
    handler: _pendingSellerApplications,
    boundContext: { superAdmin },
  }),
  createBoundTool({
    name: "getCouponEffectiveness",
    description: "Coupon usage counts, total discount given, and order value influenced, per coupon code.",
    parameters: { type: "object", properties: { limit: { type: "number" } }, required: [] },
    handler: _couponEffectiveness,
    boundContext: { superAdmin },
  }),
  createBoundTool({
    name: "getPlatformOrderStatusBreakdown",
    description: "Platform-wide order counts grouped by status.",
    parameters: { type: "object", properties: {}, required: [] },
    handler: _platformOrderStatusBreakdown,
    boundContext: { superAdmin },
  }),
  createBoundTool({
    name: "getPlatformTopProducts",
    description: "Best-selling products platform-wide (across all sellers), by units or revenue.",
    parameters: {
      type: "object",
      properties: { sortBy: { type: "string", enum: ["units", "revenue"] }, limit: { type: "number" } },
      required: [],
    },
    handler: _platformTopProducts,
    boundContext: { superAdmin },
  }),
];
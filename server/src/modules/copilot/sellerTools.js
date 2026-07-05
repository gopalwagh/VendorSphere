import mongoose from "mongoose";
import Order from "../order/order.model.js";
import Product from "../product/product.model.js";
import { createBoundTool } from "./toolFactory.js";

const oid = (id) => new mongoose.Types.ObjectId(id);

// ---- RAW HANDLERS (sellerId always comes from boundContext, never from LLM args) ----

const _salesTrend = async ({ sellerId, granularity = "month" }) => {
  const now = new Date();
  const currentStart = new Date(now.getTime() - 30 * 86400000);
  const previousStart = new Date(now.getTime() - 60 * 86400000);

  const [result] = await Order.aggregate([
    { $match: { "orderItems.seller": oid(sellerId), createdAt: { $gte: previousStart } } },
    { $unwind: "$orderItems" },
    { $match: { "orderItems.seller": oid(sellerId) } },
    {
      $group: {
        _id: null,
        currentRevenue: { $sum: { $cond: [{ $gte: ["$createdAt", currentStart] }, "$orderItems.sellerAmount", 0] } },
        currentUnits: { $sum: { $cond: [{ $gte: ["$createdAt", currentStart] }, "$orderItems.quantity", 0] } },
        previousRevenue: { $sum: { $cond: [{ $lt: ["$createdAt", currentStart] }, "$orderItems.sellerAmount", 0] } },
        previousUnits: { $sum: { $cond: [{ $lt: ["$createdAt", currentStart] }, "$orderItems.quantity", 0] } },
      },
    },
  ]);

  const data = result || { currentRevenue: 0, currentUnits: 0, previousRevenue: 0, previousUnits: 0 };
  const pctChange = data.previousRevenue > 0
    ? (((data.currentRevenue - data.previousRevenue) / data.previousRevenue) * 100).toFixed(1)
    : null;

  return JSON.stringify({ ...data, revenueChangePercent: pctChange });
};

const _profitabilityAnalysis = async ({ sellerId, sortBy = "profit_asc", limit = 10 }) => {
  const rows = await Order.aggregate([
    { $match: { "orderItems.seller": oid(sellerId) } },
    { $unwind: "$orderItems" },
    { $match: { "orderItems.seller": oid(sellerId) } },
    {
      $group: {
        _id: "$orderItems.product",
        title: { $first: "$orderItems.productTitle" },
        category: { $first: "$orderItems.productCategory" },
        unitsSold: { $sum: "$orderItems.quantity" },
        revenue: { $sum: "$orderItems.price" },
        commissionPaid: { $sum: "$orderItems.commissionAmount" },
        sellerAmount: { $sum: "$orderItems.sellerAmount" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        totalCost: { $multiply: [{ $ifNull: ["$product.costPrice", 0] }, "$unitsSold"] },
      },
    },
    {
      $addFields: {
        netProfit: { $subtract: ["$sellerAmount", "$totalCost"] },
        marginPercent: {
          $cond: [
            { $gt: ["$revenue", 0] },
            { $multiply: [{ $divide: [{ $subtract: ["$sellerAmount", "$totalCost"] }, "$revenue"] }, 100] },
            0,
          ],
        },
      },
    },
    { $project: { product: 0 } },
    { $sort: sortBy === "profit_desc" ? { netProfit: -1 } : { netProfit: 1 } },
    { $limit: limit },
  ]);

  return JSON.stringify(rows);
};

const _orderStatusBreakdown = async ({ sellerId }) => {
  const rows = await Order.aggregate([
    { $match: { "orderItems.seller": oid(sellerId) } },
    { $unwind: "$orderItems" },
    { $match: { "orderItems.seller": oid(sellerId) } },
    { $group: { _id: "$orderItems.itemStatus", count: { $sum: 1 } } },
  ]);
  return JSON.stringify(rows);
};

const _inventoryStatus = async ({ sellerId, threshold = 10 }) => {
  const items = await Product.find({
    createdBy: oid(sellerId),
    stock: { $lt: threshold },
  }).select("title stock price category").lean();
  return JSON.stringify(items);
};

const _categoryBreakdown = async ({ sellerId }) => {
  const rows = await Order.aggregate([
    { $match: { "orderItems.seller": oid(sellerId) } },
    { $unwind: "$orderItems" },
    { $match: { "orderItems.seller": oid(sellerId) } },
    {
      $group: {
        _id: "$orderItems.productCategory",
        revenue: { $sum: "$orderItems.sellerAmount" },
        unitsSold: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  return JSON.stringify(rows);
};

const _reviewInsights = async ({ sellerId, limit = 5 }) => {
  const products = await Product.find({ createdBy: oid(sellerId) })
    .select("title averageRating numOfReviews")
    .sort({ averageRating: 1 })
    .limit(limit)
    .lean();
  return JSON.stringify(products);
};

const _topSellingProducts = async ({ sellerId, sortBy = "units", limit = 5 }) => {
  const rows = await Order.aggregate([
    { $match: { "orderItems.seller": oid(sellerId) } },
    { $unwind: "$orderItems" },
    { $match: { "orderItems.seller": oid(sellerId) } },
    {
      $group: {
        _id: "$orderItems.product",
        title: { $first: "$orderItems.productTitle" },
        category: { $first: "$orderItems.productCategory" },
        unitsSold: { $sum: "$orderItems.quantity" },
        revenue: { $sum: "$orderItems.sellerAmount" },
      },
    },
    { $sort: sortBy === "revenue" ? { revenue: -1 } : { unitsSold: -1 } },
    { $limit: limit },
  ]);
  return JSON.stringify(rows);
};

const _customerInsights = async ({ sellerId }) => {
  const rows = await Order.aggregate([
    { $match: { "orderItems.seller": oid(sellerId) } },
    { $unwind: "$orderItems" },
    { $match: { "orderItems.seller": oid(sellerId) } },
    { $group: { _id: "$user", orderCount: { $sum: 1 }, totalSpent: { $sum: "$orderItems.price" } } },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        repeatCustomers: { $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] } },
        avgSpendPerCustomer: { $avg: "$totalSpent" },
      },
    },
  ]);
  return JSON.stringify(rows[0] || { totalCustomers: 0, repeatCustomers: 0, avgSpendPerCustomer: 0 });
};

// ---- TOOL FACTORY: called per-request with the authenticated seller's ID ----

export const buildSellerTools = (sellerId) => [
  createBoundTool({
    name: "getSalesTrend",
    description: "Current 30-day revenue and units vs previous 30-day period, with percent change, for this seller.",
    parameters: { type: "object", properties: {}, required: [] },
    handler: _salesTrend,
    boundContext: { sellerId },
  }),
  createBoundTool({
    name: "getProfitabilityAnalysis",
    description: "Per-product net profit and margin%, using actual commission and product cost price. Use sortBy='profit_asc' to find loss-making products to remove, 'profit_desc' for best performers.",
    parameters: {
      type: "object",
      properties: {
        sortBy: { type: "string", enum: ["profit_asc", "profit_desc"] },
        limit: { type: "number" },
      },
      required: [],
    },
    handler: _profitabilityAnalysis,
    boundContext: { sellerId },
  }),
  createBoundTool({
    name: "getOrderStatusBreakdown",
    description: "Count of this seller's order items grouped by status (pending, shipped, delivered, cancelled, etc).",
    parameters: { type: "object", properties: {}, required: [] },
    handler: _orderStatusBreakdown,
    boundContext: { sellerId },
  }),
  createBoundTool({
    name: "getInventoryStatus",
    description: "Products running low on stock for this seller.",
    parameters: {
      type: "object",
      properties: { threshold: { type: "number", description: "Stock count below which item is 'low', default 10" } },
      required: [],
    },
    handler: _inventoryStatus,
    boundContext: { sellerId },
  }),
  createBoundTool({
    name: "getCategoryBreakdown",
    description: "Revenue and units sold grouped by product category for this seller.",
    parameters: { type: "object", properties: {}, required: [] },
    handler: _categoryBreakdown,
    boundContext: { sellerId },
  }),
  createBoundTool({
    name: "getReviewInsights",
    description: "This seller's lowest-rated products, useful for finding quality issues.",
    parameters: { type: "object", properties: { limit: { type: "number" } }, required: [] },
    handler: _reviewInsights,
    boundContext: { sellerId },
  }),
  createBoundTool({
    name: "getTopSellingProducts",
    description: "Best-selling products for this seller by units sold or revenue. Use for 'best sold product', 'bestsellers', 'top products' questions.",
    parameters: {
      type: "object",
      properties: {
        sortBy: { type: "string", enum: ["units", "revenue"] },
        limit: { type: "number" },
      },
      required: [],
    },
    handler: _topSellingProducts,
    boundContext: { sellerId },
  }),
  createBoundTool({
    name: "getCustomerInsights",
    description: "Total customers, repeat-buyer count, and average spend per customer for this seller. Useful for retention and growth questions.",
    parameters: { type: "object", properties: {}, required: [] },
    handler: _customerInsights,
    boundContext: { sellerId },
  }),
];
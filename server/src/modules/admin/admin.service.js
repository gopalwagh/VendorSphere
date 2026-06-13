import Order from "../order/order.model.js";
import Product from "../product/product.model.js";
import mongoose from "mongoose";

export const getAnalyticsService = async (sellerId) => {
  const sellerObjId = new mongoose.Types.ObjectId(sellerId);

  // Run all independent queries concurrently
  const [
    summaryData,
    ratingData,
    revenueAndOrdersChart,
    categoriesData,        // replaces topCategories + bestCategory
    topProducts,
    topRatedProducts,
  ] = await Promise.all([

    // 1. Summary (revenue, orders, units sold)
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.seller": sellerObjId } },
      {
        $group: {
          _id: null,
          totalRevenue:   { $sum: "$orderItems.sellerAmount" },
          totalProductsSold: { $sum: "$orderItems.quantity" },
          totalOrders:    { $sum: 1 },          // cheaper than $addToSet + .length
        },
      },
    ]),

    // 2. Average rating across seller's products
    Product.aggregate([
      { $match: { createdBy: sellerObjId } },
      { $group: { _id: null, averageRating: { $avg: "$averageRating" } } },
    ]),

    // 3. Revenue + order count per month — one pipeline, two metrics
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.seller": sellerObjId } },
      {
        $group: {
          _id:     { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$orderItems.sellerAmount" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // 4. Top 5 categories by revenue (first result = bestCategory)
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.seller": sellerObjId } },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      { $match: { "productInfo.createdBy": sellerObjId } },
      {
        $group: {
          _id:      "$productInfo.category",
          revenue:  { $sum: "$orderItems.sellerAmount" },
          quantity: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),

    // 5. Top 5 products by units sold
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.seller": sellerObjId } },
      {
        $group: {
          _id:       "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
          revenue:   { $sum: "$orderItems.sellerAmount" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]),

    // 6. Top 5 rated products
    Product.aggregate([
      { $match: { createdBy: sellerObjId, numOfReviews: { $gt: 0 } } },
      { $sort: { averageRating: -1, numOfReviews: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    summary: {
      totalRevenue:      summaryData[0]?.totalRevenue      ?? 0,
      totalOrders:       summaryData[0]?.totalOrders       ?? 0,
      totalProductsSold: summaryData[0]?.totalProductsSold ?? 0,
      averageRating:     Number((ratingData[0]?.averageRating ?? 0).toFixed(1)),
    },
    revenueChart: revenueAndOrdersChart.map(({ _id, revenue }) => ({ _id, revenue })),
    ordersChart:  revenueAndOrdersChart.map(({ _id, orders })  => ({ _id, orders })),
    topCategories:    categoriesData,
    bestCategory:     categoriesData[0] ?? {},
    topProducts,
    topRatedProducts,
  };
};
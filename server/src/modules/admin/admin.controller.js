import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../modules/user/user.model.js"
import Product from "../product/product.model.js";
import Order from "../order/order.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers =
    await User.countDocuments();
  const totalProducts =
    await Product.countDocuments();
  const totalOrders =
    await Order.countDocuments();
  const revenueData = await Order.find({
    paymentStatus: "paid",
  });
  const totalRevenue = revenueData.reduce((acc, order) =>
    acc + order.totalAmount,
    0
  );
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      "Dashboard stats fetched"
    )
  );
});

export const getRevenueChart = asyncHandler(async (req, res) => {
  const data =
    await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        data,
        "Revenue chart data"
      )
    );
  });
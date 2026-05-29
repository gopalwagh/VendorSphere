import crypto from "crypto";
import fs from "fs";
import path from "path";

import Cart from "../cart/cart.model.js";
import Product from "../product/product.model.js";
import razorpayInstance from "../../config/razorpay.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import Order from "./order.model.js";
import User from "../user/user.model.js";
import emailQueue from "../../queues/email.queue.js";
import generateInvoice from "../../services/generateInvoice.js";
import { response } from "express";

const ORDER_STATUSES =
  Order.schema.path("orderStatus").enumValues;

export const checkout = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let totalAmount = 0;
  const orderItems = [];
 
  for (const item of cart.items) {
    if (!item.product) {
      throw new ApiError(400, "Cart contains an unavailable product");
    }

    if (item.quantity > item.product.stock) {
      throw new ApiError(
        400,
        `${item.product.title} does not have enough stock`
      );
    }

    totalAmount += item.product.price * item.quantity;

    if (totalAmount > 500000) {
      throw new ApiError(400, "Order amount exceeds Razorpay limit of ₹5,00,000");
    }

    orderItems.push({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    });
  }

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
    });
  } catch (err) {
    console.error("Razorpay error:", err);
    throw new ApiError(500, "Failed to create Razorpay order");
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    totalAmount,
    razorpayOrderId: razorpayOrder.id,
    orderTimeline: [
      {
        status: "pending",
        message: "Order created and awaiting payment",
      },
    ],
  });
  console.log(response)
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        order,
        razorpayOrder,
      },
      "Checkout initiated"
    )
  );
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new ApiError(400, "Payment details are required");
  }

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      `${razorpay_order_id}|${razorpay_payment_id}`
    )
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed");
  }

  const order = await Order.findOne({
    razorpayOrderId: razorpay_order_id,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentStatus === "paid") {
    return res.status(200).json(
      new ApiResponse(
        200,
        order,
        "Payment already verified"
      )
    );
  }

  order.paymentStatus = "paid";
  order.orderStatus = "processing";
  order.razorpayPaymentId = razorpay_payment_id;
  order.orderTimeline.push({
    status: "processing",
    message: "Payment verified and order is processing",
  });

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new ApiError(404, "Product not found for order item");
    }

    if (item.quantity > product.stock) {
      throw new ApiError(
        400,
        `${product.title} no longer has enough stock`
      );
    }

    product.stock -= item.quantity;
    await product.save();
  }

  await order.save();

  await Cart.findOneAndDelete({
    user: order.user,
  });

  const user = await User.findById(order.user);

  if (user) {
    try {
      await emailQueue.add(
        "sendOrderEmail",
        {
          to: user.email,
          subject: "Order placed successfully",
          html: `
            <h2>Order confirmed</h2>
            <p>Your payment was successful.</p>
            <p>Order Amount: Rs. ${order.totalAmount}</p>
            <p>Status: ${order.orderStatus}</p>
          `,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
          removeOnComplete: true,
        }
      );

      const invoicePath = await generateInvoice({
        order,
        user,
      });

      console.log("Invoice generated:", invoicePath);
    } catch (error) {
      console.error(
        "Post-payment tasks failed:",
        error.message
      );
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      order,
      "Payment verified successfully"
    )
  );
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate({
      path: "orderItems.product",
      select: "title images price category stock",
    })
    .sort({
      createdAt: -1,
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      orders,
      "Orders fetched successfully"
    )
  );
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "orderItems.product",
      select: "title images price stock",
    })
    .sort({
      createdAt: -1,
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      orders,
      "All orders fetched successfully"
    )
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, message } = req.body;

  if (!status || !ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = status;
  order.orderTimeline.push({
    status,
    message: message || `Order moved to ${status}`,
  });

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      order,
      "Order status updated"
    )
  );
});

export const downloadInvoice = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    req.user.role !== "admin" &&
    order.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "Not authorized to download this invoice"
    );
  }

  const filePath = path.resolve(
    "src",
    "invoices",
    `invoice-${order._id}.pdf`
  );

  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, "Invoice not found");
  }

  res.download(filePath);
});

export const trackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    req.user.role !== "admin" &&
    order.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "Not authorized to view this order"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderStatus: order.orderStatus,
        timeline: order.orderTimeline,
      },
      "Order tracking fetched successfully"
    )
  );
});

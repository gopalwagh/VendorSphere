import crypto from "crypto";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

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
import Coupon from "../coupon/coupon.model.js";
import calculateCartTotal from "../../utils/calculateCartTotal.js";

const ORDER_STATUSES =
  Order.schema.path("orderStatus").enumValues;

export const checkout = asyncHandler(async (req, res) => {

  const { couponCode, shippingAddress } = req.body.checkoutData;
  
  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate("items.product");

    // deleted products remove
  cart.items = cart.items.filter(
    (item) => item.product
  );

  // cart update karo agar kuch remove hua
  await cart.save();

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let subtotal = 0;
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

    subtotal += item.product.price * item.quantity;
    
    orderItems.push({
      product: item.product._id,
      productTitle: item.product.title,
      productImage: item.product.images?.[0]?.url || "",
      productCategory: item.product.category?.name || "",
      seller: item.product.createdBy,
      quantity: item.quantity,
      price: item.product.price,
      itemStatus: "processing",
      itemTimeline: [
        {
          status: "processing",
          message: "Order item created",
        }
      ]
    });
  }
  
  const { shipping, tax, discountPercent, discountAmount, finalAmount, } 
    = await calculateCartTotal(subtotal,couponCode);

  if(finalAmount > 500000){
    throw new ApiError(400,"Order amount exceeds Razorpay limit of ₹5,00,000");
  }

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
    });
  } catch (err) {
    throw new ApiError(500, "Failed to create Razorpay order");
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    subtotal,
    shipping,
    tax,
    discountAmount,
    totalAmount: finalAmount,
    couponCode: couponCode || null,
    shippingAddress,
    razorpayOrderId: razorpayOrder.id,
    orderTimeline: [
      {
        status: "pending",
        message: "Order created and awaiting payment",
      },
    ],
  });

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

  let order; /// order defined here 
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    }).session(session);

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
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: {
            $gte: item.quantity,
          },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedProduct) {
        throw new ApiError(
          400,
          "Product no longer has enough stock"
        );
      }

      const itemTotal = item.price * item.quantity;
      const commissionAmount = (itemTotal * item.commissionPercent) / 100;

      const sellerAmount = itemTotal - commissionAmount;

      item.commissionAmount = commissionAmount;
      item.sellerAmount = sellerAmount;
      
      item.itemTimeline.push({
        status: "processing",
        message: "Payment verified",
      })

    }

    await order.save({ session });

    await Cart.findOneAndDelete(
      {
        user: order.user,
      },
      {
        session,
      }
    );

    await session.commitTransaction();

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
  } 
  catch(error){
    await session.abortTransaction();
    throw error;
  } 
  finally {
    session.endSession();
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
      select: "title images price category stock createdBy",
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
      select: "title images price stock createdBy",
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

  if(order.paymentStatus !== "paid"){
    throw new ApiError(
        400,
        "Cannot update unpaid order"
    );
  }
  
  const priority = [ "pending", "processing", "packed", "shipped", "out_for_delivery", "delivered" ];

  const previousStatus = order.orderStatus;

  let sellerFound = false;
  for (const item of order.orderItems) {
    if (item.seller.toString() ===req.user._id.toString()) {
      sellerFound = true;

      const currentIndex = priority.indexOf(item.itemStatus);
      const newIndex = priority.indexOf(status);

      if (newIndex < currentIndex) {
        throw new ApiError(
          400,
          "Cannot move order backward"
        );
      }
      if (newIndex === currentIndex) {
        throw new ApiError(
          400,
          `Order already ${status}`
        );
      }

      item.itemStatus = status;

      item.itemTimeline.push({
        status,
        message:
          message || `Item moved to ${status}`,
      });
    }
  }

  if (!sellerFound) {
    throw new ApiError(
      403,
      "You cannot update this order"
    );
  }

  const statuses = order.orderItems.map(item => item.itemStatus);

  const indexes = statuses.map(
    status => priority.indexOf(status)
  );

  const minIndex = Math.min(...indexes);

  order.orderStatus = priority[minIndex];

  if(previousStatus !== order.orderStatus){
    order.orderTimeline.push({
      status: order.orderStatus,
      message: `Order moved to ${order.orderStatus}`
    });
  }

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
  const order = await Order.findById(orderId).populate(
    "orderItems.product",
    "tittle images price"
  );

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
        order,
        orderStatus: order.orderStatus,
        timeline: order.orderTimeline,
      },
      "Order tracking fetched successfully"
    )
  );
});

export const getAdminOrders = asyncHandler(async(req, res) => {
  const orders = await Order.find({
    "orderItems.seller": req.user._id,
  })
  .populate("user", "name email")
  .populate("orderItems.product", "title price images stock")
  .sort({ createdAt: -1, });

  const adminOrders = orders.map((order) => {
    const sellerItems = order.orderItems
      .filter((item) => item.seller.toString() === req.user._id.toString());

    const sellerRevenue = sellerItems.reduce((sum, item) =>
      sum + item.price * item.quantity, 0); 

    const sellerEarnings = sellerItems.reduce((sum, item) => sum + item.sellerAmount,0);

    return {
      _id: order._id,
      customer: order.user,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      orderTimeline: order.orderTimeline,
      createdAt: order.createdAt,
      sellerEarnings,
      sellerRevenue,
      orderItems: sellerItems,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      adminOrders,
      "Admin orders fetched successfully"
    )
  )
})


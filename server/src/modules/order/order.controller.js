import crypto from "crypto";
import { create } from "domain";
import path from "path";

import Cart from "../cart/cart.model.js";
import Product from "../product/product.model.js";

import razorpayInstance from "../../config/razorpay.js";

import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import Order from "./order.model.js";
import User from "../user/user.model.js";
import emailQueue from
"../../queues/email.queue.js";
import generateInvoice from "../../services/generateInvoice.js";

export const checkout = asyncHandler(async(req, res) => {
  const cart = await Cart.findOne({
    user : req.user._id,
  })
  .populate("items.product");

  if(!cart || cart.items.length === 0){
    throw new ApiError(400, "Cart is Empty");
  }

  // calculate total amount 
  let totalAmount = 0;
  const orderItems = [];

  cart.items.forEach((item) => {
    totalAmount +=
      item.product.price * item.quantity;

    orderItems.push({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    });
  });
  // create razorpay order to the items
  const razorpayOrder = await razorpayInstance.orders.create({
    amount : totalAmount*100, // because of razorpay takes payments in paise format
    currency : "INR",
  });
  //create pending order so 
  const order = await Order.create({
    user : req.user._id,
    orderItems,
    totalAmount,
    razorpayOrderId : razorpayOrder.id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        order,
        razorpayOrder,
      },
      "Checkouts initiated"
    )
  );
});

export const verifyPayment = asyncHandler(async(req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  // generated expected signature 
  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      `${razorpay_order_id}|${razorpay_payment_id}`
    )
    .digest("hex");

    // signature compare karenge ab
    if( generatedSignature !== razorpay_signature ){
      throw new ApiError(400, "Payment Verification Failed");
    }
    // find karo Order
    const order = await Order.findOne({
      razorpayOrderId : razorpay_order_id,
    });
    if (!order) {
    throw new ApiError(404,"Order not found");
    
    // update order
    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();
    // email send 
    const user = await User.findById(order.user);
    await emailQueue.add(
      "sendOrderEmail",
      {
        to: user.email,
        subject : "Order Placed successfully",
        html : `
          <h2>Order Confirmed 🎉</h2>
          <p>Your payment was successful.</p>
          <p>Order Amount: ₹${order.totalAmount}</p>
          <p>Status: ${order.orderStatus}</p>
        `,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        // ek bar send ho gaya complete remove from redis
        removeOnComplete: true,
      }
    );
    // Invoice generated
    const invoicePath = await generateInvoice({
      order, user,
    });
    console.log("Invoice generated:",
    invoicePath);
    // reduce product stock
    for(const item of order.orderItems){
      const product = await Product.findById(item.product);
      if(product){
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // ab cart ko clear karo
    await Cart.findOneAndDelete({
      user : order.user,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        order,
        "Payment verified successfully"
      )
    );
  }
})

export const getMyOrders = asyncHandler(async(req, res) => {
  const orders = await Order.find({
    user : req.user._id,
  })
  .populate({
    path : "orderItems.product",
    select : "title images price category",
  })
  .sort({
    createAt : -1,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      orders,
      "Orders fetched successfully"
    )
  );
});

export const getAllOrders = asyncHandler(async(req, res) => {
  const orders = await Order.find()
    .populate({
      path : "user",
      select : "name email",
    })
    .populate({
      path : "orderItems.product",
      select : "title images price",
    })
    .sort({
      createAt : -1, // latest comes first
    })
  
  return res.status(200).json(
    new ApiResponse(
      200,
      orders,
      "All ordes fetched successfully"
    )
  );  
});

export const updateOrderStatus = asyncHandler(async(req, res) => {
  const { orderId } = req.params;
  const { status, message } = req.body;
  
  const order = await Order.findById(orderId);
  if(!order){
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = status;
  // add timeline entry
  order.orderTimeline.push({
    status,
    message: message || `Order moved to ${status}`,
    updatedAt: new Date(),
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

// pdfdownload Invoice api
export const downloadInvoice = asyncHandler(async(req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if(!order){
    throw new ApiError(404, "Order not Found");
  }
  const filePath = path.join(
    "src",
    "invoices",
    `invoice-${order._id}.pdf`
  );

  res.download(filePath);
});

export const trackOrder = asyncHandler(async(req, res) =>{ 
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if(!order){
    throw new ApiError(404, "Order not Found");
  }
 // optional: ensure user owns order (important)
  if (order.user.toString() !== req.user._id.toString()){
    throw new ApiError(403,"Not authorized to view this order");
  };
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderStatus: order.orderStatus,
        timeline : order.orderTimeline,
      },
      "Order tracking fetched successfully"
    )
  );
});
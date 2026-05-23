import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User",
      required : true,
    },
    orderItems : [
      {
        product : {
          type : mongoose.Schema.Types.ObjectId,
          ref : "Product",
        },
        quantity : Number,
        price : Number,
      },
    ],
    totalAmount : {
      type : Number,
      required : true,
    },
    paymentStatus : {
      type :String,
      enum : [
        "pending",
        "paid",
        "failed"
      ],
      default : "pending"
    },
    orderStatus :{
      type : String,
      enum : [
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default : "processing",
    },
    razorpayOrderId : String,
    razorpayPaymentId : String,
  },
  { timestamps : true }
);

const Order = mongoose.model("Order",orderSchema);

export default Order;
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
        "pending",
        "paid",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default : "processing",
    },
    message : String,
    updatedAt :{
      type: Date,
      Dafault: Date.now,
    },
    razorpayOrderId : String,
    razorpayPaymentId : String,
  },
  { timestamps : true }
);

const Order = mongoose.model("Order",orderSchema);

export default Order;
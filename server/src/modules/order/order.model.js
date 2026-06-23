import mongoose from "mongoose";

const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const orderTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    addressLine1: String,
    city: String,
    state: String,
    pincode: String,
  },
  {
    _id: false,
  }
)
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        
        productTitle: {
          type: String,
          required: true,
        },

        productImage: {
          type: String,
          default: "",
        },

        productCategory: {
          type: String,
          default: "",
        },

        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        quantity: Number,
        price: Number,
        commissionPercent: {
          type: Number,
          default: 10,
        },
        commissionAmount: {
          type: Number,
          default: 0,
        },
        sellerAmount: {
          type:Number,
          default: 0,
        },
        itemStatus: {
          type: String,
          enum: ORDER_STATUSES,
          default: "processing",
        },

        itemTimeline: {
          type: [orderTimelineSchema],
          default: [],
        },
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shipping: Number,
    subtotal : Number,
    tax: Number,
    discountAmount: Number,
    couponCode: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    shippingAddress: shippingAddressSchema,
    invoice: {
      url: String,
      public_id: String,
      generatedAt: Date,
    },
    message: String,
    orderTimeline: {
      type: [orderTimelineSchema],
      default: [],
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

orderSchema.index({ "orderItems.seller": 1, createdAt: -1 });

orderSchema.index({ razorpayOrderId: 1 }, { sparse: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError.js";
import asyncHandler from "./utils/asyncHandler.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import protect from "./middleware/authMiddleware.js";
import productRoutes from "./modules/product/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import couponRoutes from "./modules/coupon/coupon.routes.js";
import sellerRoutes from "./modules/seller/seller.routes.js";
import superAdminRoutes from "./modules/superAdmin/superAdmin.routes.js";

const app = express();
const limiter = rateLimit({
  windowMs : 15 * 60 * 1000, // 15 miniutes
  limit : 100,
  message : "Too many requests, try again later",
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(limiter);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=> {
  res.json({
    success: true,
    message: "API is running"
  });
});

app.get("/error",
  asyncHandler(async(req,res)=> {
    throw new ApiError(404,"test error");
  })
);

app.get("/profile",protect,(req,res)=> {
  res.status(200).json({
    success : true,
    user : req.user,
  });
});

app.use("/api/auth",authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons",couponRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/superAdmin", superAdminRoutes);

app.use(errorMiddleware);

export default app;

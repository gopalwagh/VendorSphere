import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import ApiError from "./utils/ApiError.js";
import asyncHandler from "./utils/asyncHandler.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import protect from "./middleware/authMiddleware.js";
import productRoutes from "./modules/product/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

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

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

app.use(errorMiddleware);

export default app;
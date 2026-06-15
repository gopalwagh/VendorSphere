import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import productReducer from "../features/products/productSlice";
import cartReducer from "../features/cart/cartSlice";
import couponReducer from "../features/coupon/couponSlice";
import ordersReducer from "../features/orders/orderSlice";
import adminReducer from "../features/admin/adminSlice";
import sellerReducer from "../features/seller/sellerSlice";

export const store = configureStore({
  reducer: {
    auth : authReducer,
    admin: adminReducer,
    product : productReducer,
    cart : cartReducer,
    coupon: couponReducer,
    orders: ordersReducer,
    seller: sellerReducer,
  },
});
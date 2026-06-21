import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import productReducer from "../features/products/productSlice";
import cartReducer from "../features/cart/cartSlice";
import couponReducer from "../features/coupon/couponSlice";
import ordersReducer from "../features/orders/orderSlice";
import sellerReducer from "../features/seller/sellerSlice";
import superAdminReducer from "../features/superAdmin/superAdminSlice";

export const store = configureStore({
  reducer: {
    auth : authReducer,
    seller: sellerReducer,
    product : productReducer,
    cart : cartReducer,
    coupon: couponReducer,
    orders: ordersReducer,
    superAdmin: superAdminReducer,
  },
});
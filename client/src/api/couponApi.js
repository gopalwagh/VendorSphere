import axios from "axios";
import axiosInstance from "./axios";

export const applyCouponApi = ( couponCode ) => {
  return axiosInstance.post("/coupons/apply",{
    couponCode,
  });
};
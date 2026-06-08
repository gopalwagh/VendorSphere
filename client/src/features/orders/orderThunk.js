import { checkoutApi, verifyPaymentApi } from "../../api/orderApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

export const checkoutThunk = (checkoutData) => {
  return async () => {
    try {
      const response = await checkoutApi({checkoutData});     
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {   
      console.log("Checkout Error:", error);
      console.log("Response:", error.response?.data);
   
      return {
        success: false,
        message: error.response?.data?.message || "Checkout Failed",
      };
    }
  };
};

export const verifyPaymentThunk = ( paymentData ) => {
  return async (dispatch) => {
    try {
      const response = await verifyPaymentApi(paymentData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Payment Verification Failed",
      };
    }
  };
};

export const fetchMyOrdersThunk = createAsyncThunk("orders/fetchMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/orders/my-orders");
      return res.data.data;
    } catch ( error ){
      return rejectWithValue(error.response?.data?.message || "Failed to Fetch Orders");
    }
});


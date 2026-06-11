import { checkoutApi, verifyPaymentApi,getAllOrdersApi, updateOrderStatusApi, getOrderDetailsApi, getAdminOrdersApi, } from "../../api/orderApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";
import { setLoading, setAdminOrders, setDashboard } from "./orderSlice";

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

export const fetchAllOrdersThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      const orders = await getAllOrdersApi();
      dispatch(
        setAdminOrders(orders)
      );

      return {
        success: true,
        data: orders,
      }

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateOrderStatusThunk = ( orderId, status ) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await updateOrderStatusApi( orderId, status );

      return {
        status: true,
        data: response.data,
      }
    } catch( error ){
      console.log("Error",error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update order",
      };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchAdminOrdersThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await getAdminOrdersApi();

      dispatch(
        setAdminOrders(response.data.data)
      );

      return {
        success: true,
        data: response.data.data,
      }
    }catch(error){
      console.log("Error: ",error);
      return {
        success: false,
        message:
          error.response?.data?.message,
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
}

import { 
  applyCouponApi, 
  createCouponApi,
  fetchAllCouponsApi,
  deleteCouponApi, 
} from "../../api/couponApi";

import { setCoupon, setAllCoupons, setLoading } from "./couponSlice";

export const applyCouponThunk = (couponCode) => {
  return async (dispatch) => {
    try {
      const response = await applyCouponApi(couponCode);
      dispatch(setCoupon(response.data.data));
      return {
        success: true,
      }
      
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message,
      };
    }
  }
}

export const createCouponThunk = (couponData) => {
  return async (dispatch) => {
    try {
      const response = await createCouponApi(couponData);

      dispatch(setCoupon(response.data.data));

      dispatch(fetchAllCouponsThunk());

      return {
        success: true,
      }
      
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message,
      };
    }
  }
}

export const fetchAllCouponsThunk = () => {
  return async (dispatch) => {
    try {
      const response = await fetchAllCouponsApi();
      dispatch(setAllCoupons(response.data.data));
      return {
        success: true,
      }
      
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message,
      };
    }
  }
}

export const deleteCouponThunk = (couponId) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await deleteCouponApi(couponId);
      
      dispatch(fetchAllCouponsThunk()); // refresh list
      return { 
        success: true, 
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    } finally {
      dispatch(setLoading(false));
    }
  };
}
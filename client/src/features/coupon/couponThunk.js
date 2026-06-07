import { applyCouponApi, } from "../../api/couponApi";
import { setCoupon } from "./couponSlice";

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
import { setLogout, setUser, setLoading, setError, setFetchedUser } from "./authSlice";
import { loginUser, getCurrentUser, registerUser, logoutUser } from "../../api/authApi";
import { clearCart } from "../cart/cartSlice";
import { clearCoupon } from "../coupon/couponSlice";

const clearSessionState = (dispatch) => {
  dispatch(clearCart());
  dispatch(clearCoupon());
};

export const checkAuth = () => {
  return async(dispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await getCurrentUser();

      dispatch(setUser(response.data.data.user));
      dispatch(setFetchedUser(true));
    } catch (error) {
      dispatch(setLogout());
      clearSessionState(dispatch);
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export const loginThunk = (credentials) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await loginUser(credentials);
      
      const response = await getCurrentUser();
      const dataInfo = response.data.data
      dispatch(setUser(dataInfo.user));
      dispatch(setFetchedUser(true));
      
      return {
        success: true,
        role: dataInfo.user.role,
        sellerStatus: dataInfo.user.sellerStatus,
      };

    } catch(error) {
      console.error("Login failed:", error);
      dispatch(setLogout());
      return {
        success: false,
        message : error.response?.data?.message
      };

    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const registerThunk = (userData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await registerUser(userData);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration Failed",
      };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const logoutThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await logoutUser();
      dispatch(setLogout());
      clearSessionState(dispatch);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Logout Failed",
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
}

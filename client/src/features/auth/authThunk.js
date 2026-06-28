import { setLogout, setUser, setLoading, setError, setFetchedUser } from "./authSlice";
import { loginUser, getCurrentUser, registerUser, logoutUser } from "../../api/authApi";
import { updateUserProfileApi } from "../../api/userApi";
import { clearCart } from "../cart/cartSlice";
import { clearCoupon } from "../coupon/couponSlice";
import { normalizeRole } from "./roleUtils";
import { resetAnalytics } from "../seller/sellerSlice";
import { resetProductState } from "../products/productSlice";
import { resetOrderState } from "../orders/orderSlice";
import { resetSellerState } from "../superAdmin/superAdminSlice";
import { saveFcmTokenApi } from "../../api/notificationApi";
import { requestPermission } from "../../firebase/requestPermission";

const normalizeUser = (user) => {
  if (!user) return user;

  return {
    ...user,
    role: normalizeRole(user.role),
  };
};

const clearSessionState = (dispatch) => {
  dispatch(clearCart());
  dispatch(clearCoupon());
  dispatch(resetAnalytics());
  dispatch(resetProductState());
  dispatch(resetOrderState());
  dispatch(resetSellerState());
};

export const checkAuth = () => {
  return async(dispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await getCurrentUser();

      dispatch(setUser(normalizeUser(response.data.data.user)));
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
      const normalizedUser = normalizeUser(dataInfo.user);
      dispatch(setUser(normalizedUser));
      dispatch(setFetchedUser(true));
      
      try{
        const token = await requestPermission();
        if(token){
          await saveFcmTokenApi(token);
        }
      } catch(err){
        console.log("FCM setup failed",err);
      }
      
      return {
        success: true,
        role: normalizedUser.role,
        sellerStatus: normalizedUser.sellerStatus,
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
      await registerUser({
        ...userData,
        role: normalizeRole(userData.role),
      });
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

/**
 * FIX: Redirect-to-home bug after profile save.
 *
 * Root cause: The backend's /auth/update-profile endpoint may return a partial
 * user DTO that omits `sellerStatus`, `role`, or other fields that SellerApprovedRoute
 * and ProtectedRoute depend on.  When setUser() was called with only the partial
 * data, those fields were wiped, causing the route guard to redirect to "/" or
 * "/seller/application".
 *
 * Solution: Merge the API response ON TOP OF the current Redux user object so
 * existing fields are preserved and only the returned fields are overwritten.
 */
export const updateUserProfileThunk = (userData) => {
  return async (dispatch, getState) => {
    try {
      const response = await updateUserProfileApi(userData);

      // Safely extract user data regardless of whether the backend wraps it in
      // `data.data` (standard pattern) or just `data`.
      const apiData = response?.data?.data ?? response?.data ?? {};

      // Keep all existing user fields (role, sellerStatus, etc.) and overwrite
      // only the fields that the API actually returned.
      const currentUser = getState().auth.user;
      const updatedUser = normalizeUser({
        ...currentUser,
        ...apiData,
      });

      dispatch(setUser(updatedUser));

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
      };
    }
  };
};

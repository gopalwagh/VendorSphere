import { logout, setUser, setLoading } from "./authSlice";
import { loginUser, getCurrentUser, registerUser, logoutUser } from "../../api/authApi";

export const checkAuth = () => {
  return async(dispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await getCurrentUser();

      dispatch(setUser(response.data.data.user));
      
    } catch (error) {
      dispatch(logout);
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
      
      dispatch(setUser(response.data.data.user));

      return {
        success: true,
      };

    } catch(error) {
      dispatch(logout());
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
      dispatch(logout());
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
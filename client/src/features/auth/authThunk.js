import { setLogout, setUser, setLoading, setError, setFetchedUser } from "./authSlice";
import { loginUser, getCurrentUser, registerUser, logoutUser } from "../../api/authApi";

export const checkAuth = () => {
  return async(dispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await getCurrentUser();

      dispatch(setUser(response.data.data.user));
      dispatch(setFetchedUser(true));
    } catch (error) {
      dispatch(setLogout());
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
      dispatch(setFetchedUser(true))
      return {
        success: true,
        role: response.data.data.user.role,
      };

    } catch(error) {
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
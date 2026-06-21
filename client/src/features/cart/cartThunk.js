import { addToCartApi, getCartApi, updateCartApi, removeCartApi } from "../../api/cartApi";
import { clearCoupon } from "../coupon/couponSlice";
import { setAddToCartLoading, setCart, setLoading } from "./cartSlice";
import { ROLES, normalizeRole } from "../auth/roleUtils";

export const getCartThunk = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const authState = getState().auth;
      const role = normalizeRole(authState.user?.role);

      if (!authState.isAuthenticated || role !== ROLES.USER) {
        return {
          success: true,
          data: {
            cart: { items: [] },
            summary: {
              totalItems: 0,
              subtotal: 0,
            },
          },
        };
      }

      const response = await getCartApi();
      dispatch(setCart(response.data.data));

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to load cart",
      };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const addToCartThunk = (productId, quantity) => {
  return async (dispatch) => {
    try {
      dispatch(setAddToCartLoading(true));

      const response = await addToCartApi(productId, quantity);

      dispatch(setCart(response.data.data));
      dispatch(clearCoupon());

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add product",
      };
    } finally {
      dispatch(setAddToCartLoading(false));
    }
  };
};

export const updateCartThunk = (productId, quantity) => {
  return async (dispatch) => {
    try {
      const response = await updateCartApi(productId, quantity);

      dispatch(setCart(response.data.data));
      dispatch(clearCoupon());

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update cart",
      };
    }
  };
};

export const removeCartThunk = (productId) => {
  return async (dispatch) => {
    try {
      const response = await removeCartApi(productId);

      dispatch(setCart(response.data.data));
      dispatch(clearCoupon());

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove item",
      };
    }
  };
};

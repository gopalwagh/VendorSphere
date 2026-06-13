import toast from "react-hot-toast";
import { addToCartApi, getCartApi, updateCartApi, removeCartApi } from "../../api/cartApi";
import { setAddToCartLoading, setCart, setLoading, setFetchCart } from "./cartSlice";

export const getCartThunk = () => {
  return async(dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const user = getState().auth;

      if (!user.isAuthenticated || user.user?.role === "admin") {
        return;
      }
    
      const response = await getCartApi();

      dispatch(setCart(response.data.data));
      
    } finally {
      dispatch(setLoading(false));
    } 
  }
};

export const addToCartThunk = (productId, quantity) => {
  return async(dispatch) => {
    try {
      const response = await addToCartApi(
        productId, quantity
      );
      
      dispatch(setCart(response.data.data));

      dispatch(setAddToCartLoading(true));

      return { 
        success: true
      };
      
      if(result.success){
        dispatch(clearCoupon());
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    } finally {
      dispatch(
        setAddToCartLoading(false)
      );
    }

  };
};

export const updateCartThunk = (productId, quantity) => {
  return async(dispatch) => {
    try {
      const response = await updateCartApi(productId,quantity);

      dispatch(setCart(response.data.data));

    } catch (error) {
      toast.error(error.message);
    }
  };
};

export const removeCartThunk = (productId) => {
  return async(dispatch) => {
    try {
      const response = await removeCartApi(productId);

      dispatch(setCart(response.data.data));
      
    } catch (error) {
      toast.error(error.message);      
    }
  }
}
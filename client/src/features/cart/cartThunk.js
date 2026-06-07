import toast from "react-hot-toast";
import { addToCartApi, getCartApi, updateCartApi, removeCartApi } from "../../api/cartApi";
import { setAddToCartLoading, setCart, setLoading, } from "./cartSlice";

export const getCartThunk = () => {
  return async(dispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await getCartApi();

      dispatch(setCart(response.data.data));
      
    } finally {
      dispatch(setLoading(false));
    }
    
  };
};

export const addToCartThunk = (productId, quantity) => {
  return async(dispatch) => {
    try {
      await addToCartApi(
        productId, quantity
      );

      dispatch(getCartThunk());
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
      await updateCartApi(productId,quantity);
      dispatch(getCartThunk());

    } catch (error) {
      toast.error(error.message);
    }
  };
};

export const removeCartThunk = (productId) => {
  return async(dispatch) => {
    try {
      await removeCartApi(productId);
      dispatch(getCartThunk());
      
    } catch (error) {
      toast.error(error.message);      
    }
  }
}
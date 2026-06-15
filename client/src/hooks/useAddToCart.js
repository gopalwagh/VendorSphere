import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { addToCartThunk } from "../features/cart/cartThunk";

const useAddToCart = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const addToCart = async (
    product,
    quantity = 1
  ) => {
    if (!isAuthenticated) {
      toast.error("Please Login First");
      navigate("/login");
      return {
        success: false,
        message: "Please Login First",
      };
    }

    if (quantity > product.stock) {
      toast.error("Not enough stock");
      return {
        success: false,
        message: "Not enough stock",
      };
    }

    const result = await dispatch(
      addToCartThunk(
        product._id,
        quantity
      )
    );

    if (result.success) {
      toast.success("Added To Cart");
    } else {
      toast.error(result.message);
    }

    return result;
  };

  return { addToCart };
};

export default useAddToCart;

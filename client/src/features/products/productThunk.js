import { getAllProducts, getProductById } from "../../api/productApi";

import { setProduct, setError, setLoading, setSelectedProduct } from "./productSlice";

export const fetchProducts = (filters) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await getAllProducts(filters);
      
      dispatch(
        setProduct({
          products: response.data.data.products,
          pagination: response.data.data.pagination,
        })
      );
    } catch (error) {
      dispatch(setError(
        error.response?.data?.message
      ));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchProductDetails = (productId) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const response = await getProductById(productId);
      
      dispatch(setSelectedProduct(response.data.data));
    } catch (error) {
      dispatch(setError
        (setLoading(false))
      );
    } finally {
      dispatch(setLoading(false));
    }
  };
};
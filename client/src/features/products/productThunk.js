import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getAdminProductApi, 
  getAllProducts, 
  getProductById, 
  updateProductApi, 
  createProductApi, 
  deleteProductApi,
  importProductsApi
} from "../../api/productApi";

import { 
  setProduct, 
  setError, 
  setLoading, 
  setSelectedProduct, 
  setSellerProducts 
} from "./productSlice";

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
      dispatch(setSelectedProduct(null));
      dispatch(setError
        (error.response?.data?.message)
      );
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchAdminProductsThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      
      const response = 
      await getAdminProductApi();
      // data comes in response.data
      dispatch(setSellerProducts(response.data));

    } catch( error ){
      dispatch(
        setError(
          error.response?.data?.message
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createProductThunk = (formData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      const response = await createProductApi(formData);

      return {
        success: true,
        data: response.data,
      }

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateProductThunk = (productId, formData) => {
  return async (dispatch) => {
    try{ 
      dispatch(setLoading(true));
      const response = await updateProductApi( productId, formData );
      return {
        success: true,
        data: response.data.data,
      }

    } catch(error) {
      return {
        success: false,
        message:
          error.response?.data?.message,
      };

    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const deleteProductThunk = (productId) => {
  return async(dispatch) =>{
    try {
      dispatch(setLoading(true));
      const response = await deleteProductApi(productId);

      return {
        success: true,
        message: response.message || response.data?.message || "Product deleted",
      }
    } catch(error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to delete product",
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
}

export const bulkUploadProductsThunk = (formdata) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true))
      const response = await importProductsApi(formData);

      return {
        success: true,
        data : response,
      };
    } catch(error) {
      return {
        success: false,
        message: error.response?.data?.message || "Bulk upload failed",
      }
    } finally {
      dispatch(setLoading(false));
    }
  };
};
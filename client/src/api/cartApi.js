import axios from "axios";
import axiosInstance from "./axios";

export const addToCartApi = (productId, quantity) => {
  return axiosInstance.post(
    "/cart", {
      productId, quantity,
    }
  );
};

export const getCartApi = () => {
  return axiosInstance.get("/cart");
};

export const updateCartApi = (productId, quantity) => {
  return axiosInstance.patch(
    `/cart/${productId}`, { quantity, }
  );
};

export const removeCartApi = (productId) => {
  return axiosInstance.delete(
    `/cart/${productId}`
  );
};
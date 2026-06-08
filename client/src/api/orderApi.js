import axiosInstance from "./axios";

export const checkoutApi = async(data) => {
  const response = await axiosInstance.post("/orders/checkout", data);
  return response.data;
}

export const verifyPaymentApi = async(data) => {
  const response = await axiosInstance.post("/orders/verify-payment", data );

  return response.data;
}

export const getOrderDetailsApi = async(orderId) => {
  const response = await axiosInstance.get(
    `/orders/track/${orderId}`
  );
  return response.data;
}
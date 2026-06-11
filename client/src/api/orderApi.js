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

export const getAllOrdersApi = async () => {
  const response = await axiosInstance.get("/orders/admin/all-orders");

  return response.data.data;
}

export const updateOrderStatusApi = async (orderId, status) => {
  const response = await axiosInstance.patch(
    `/orders/admin/update-status/${orderId}`, 
    { status }
  );
  return response.data;
}

export const getAdminOrdersApi = async() => {
  const response = await axiosInstance.get("/orders/admin/my-orders");
  return response;
}

import axiosInstance from "./axios";

export const getAnalyticsApi =
async () => {
  return await axiosInstance.get(
    "/seller/analytics"
  );
};

export const getSellerProfileApi = async () => {
  const response = await axiosInstance.get(
    "/seller/profile"
  );
  return response;
}

export const applySellerProfileApi = async(formData) => {
  const response = await axiosInstance.post("/seller/apply", formData, {
    headers: {
      "Content-Type":
        "multipart/form-data",
    },
  });
  return response;
};
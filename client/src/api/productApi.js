import axiosInstance from "./axios";

export const getAllProducts = ({
    page = 1,
    limit = 10,
    category = "",
    search = "",
    sort = "",
}) => {
  return axiosInstance.get(
    `/products?page=${page}&limit=${limit}&category=${category}&search=${search}&sort=${sort}`
  );
};

export const getProductById = (productId) => {
  return axiosInstance.get(
    `/products/${productId}`
  );
}

export const getAdminProductApi = async () => {
  const response = await axiosInstance.get(
    "/products/seller/products"
  );
  return response.data;
};

export const createProductApi = async ( formData ) => {
  const response = await axiosInstance.post(
      "/products/create", formData,
      {
        headers: 
        { 
          "Content-Type": "multipart/form-data",
        },
      }
    );

  return response.data;
};

export const updateProductApi = async ( productId, formData ) => 
{
  const response = await axiosInstance.patch(
      `/products/${productId}`, formData,
      {
        headers: 
        {
          "Content-Type": "multipart/form-data",
        },
      }
    );

  return response.data;
};

export const deleteProductApi = async(productId) => {
  const response = await axiosInstance.delete(`/products/${productId}`);
  return response.data;
}

export const postReviewApi = async (productId, reviewData) => {
  const response = await axiosInstance.post(`/products/review/${productId}`, reviewData);
  return response.data;
};

export const getProductReviewsApi = async (productId) => {
  const response = await axiosInstance.get(`/products/reviews/${productId}`);
  return response.data;
};

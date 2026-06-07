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
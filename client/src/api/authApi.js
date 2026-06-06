import { data } from "react-router-dom";
import axiosInstance from "./axios";

export const registerUser = (data) => {
  return axiosInstance.post(
    "/auth/register",
    data
  );
};

export const loginUser = (data) => {
  return axiosInstance.post(
    "/auth/login",
    data
  );
};

export const logoutUser = () => {
  return axiosInstance.post(
    "/auth/logout"
  );
};

export const getCurrentUser = () => {
  return axiosInstance.get(
    "/auth/me"
  );
};
import axios from "axios";
import axiosInstance from "./axios";

export const getAnalyticsApi =
async () => {
  return await axiosInstance.get(
    "/admin/analytics"
  );
};
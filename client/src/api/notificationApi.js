import axiosInstance from "./axios";

export const saveFcmTokenApi = async(token) => {
  return await axiosInstance.post("/notifications/save-token",{
    token,
  })
}
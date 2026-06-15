import axiosInstance from "./axios";

export const getSellerProfileApi = async () => {
  const response = await axiosInstance.get(
    "/seller/profile"
  );
  return response;
}

export const getPendingApplicationsApi =  async() => {
  const response = await axiosInstance.get(
    "/seller/applications"
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

export const approveApplicationApi = async(id) => {
  const response = await axiosInstance.patch(
    `/seller/${id}/approve`
  );
  return response;
}

export const rejectApplicationApi = async (id, reason ) => {
  const response = await axiosInstance.patch(
    `/seller/${id}/reject`, {
      reason
    }
  );
  return response;
};

export const getSuperAdminDashboardApi = async () => {
  const response = await axiosInstance.get(
    "/seller/dashboard"
  );
  return response;
};

export const getApprovedApplicationsApi = async() => {
  return await axiosInstance.get(
    "/seller/applications/approved"
  );
};

export const getAllUsersApi = async() => {
  return await axiosInstance.get(
    "/seller/users"
  )
};
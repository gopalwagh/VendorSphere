import axiosInstance from "./axios";

export const getPendingApplicationsApi =  async() => {
  const response = await axiosInstance.get(
    "/superAdmin/applications"
  );
  return response;
}

export const approveApplicationApi = async(id) => {
  const response = await axiosInstance.patch(
    `/superAdmin/${id}/approve`
  );
  return response;
}

export const rejectApplicationApi = async (id, reason ) => {
  const response = await axiosInstance.patch(
    `/superAdmin/${id}/reject`, {
      reason
    }
  );
  return response;
};

export const getSuperAdminDashboardApi = async () => {
  const response = await axiosInstance.get(
    "/superAdmin/dashboard"
  );
  return response;
};

export const getApprovedApplicationsApi = async() => {
  return await axiosInstance.get(
    "/superAdmin/applications/approved"
  );
};

export const getAllUsersApi = async() => {
  return await axiosInstance.get(
    "/superAdmin/users"
  )
};
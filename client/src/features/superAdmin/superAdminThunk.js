import { 
  setSellerError, 
  setSellerProfile, 
  setSellerLoading, 
  setPendingApplications,
  setSuperAdminDashboard, 
  setApprovedApplications,
  setAllUsers, 
} from "./superAdminSlice.js";

import { 
  getSellerProfileApi, 
  applySellerProfileApi, 
} from "../../api/sellerApi.js";

import { updateSellerProfileApi } from "../../api/userApi.js";

import { 
  getPendingApplicationsApi, 
  rejectApplicationApi, 
  approveApplicationApi, 
  getSuperAdminDashboardApi,
  getApprovedApplicationsApi,
  getAllUsersApi,
} from "../../api/superAdminApi.js";

import { setUser } from "../auth/authSlice.js";

export const fetchSellerProfileThunk = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(setSellerLoading(true));
      const response = await getSellerProfileApi();
      const sellerProfile = response.data.data;
      
      dispatch(setSellerProfile(sellerProfile));

      const currentUser = getState().auth.user;
      if (currentUser && sellerProfile?.applicationStatus) {
        dispatch(
          setUser({
            ...currentUser,
            sellerStatus: sellerProfile.applicationStatus,
          })
        );
      }

    } catch (error) {
      dispatch(
        setSellerProfile(null)
      );

    } finally {
      dispatch(
        setSellerLoading(false)
      );
    }
  };
};

export const fetchPendingApplicationThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setSellerLoading(true));     
      
      const response = await getPendingApplicationsApi();

      dispatch(setPendingApplications(response.data.data));

    } catch(error) {
        dispatch(
          setSellerError(error.response?.data?.message)
        );
    } finally {
      dispatch(setSellerLoading(false));
    }
  }   
}

export const applySellerProfileThunk =(formData) => {
  return async(dispatch, getState) => {
    try {
      dispatch(setSellerLoading(true));
      const response = await applySellerProfileApi(formData);
      const sellerProfile = response.data.data;
      
      dispatch(setSellerProfile(sellerProfile));

      const currentUser = getState().auth.user;
      if (currentUser) {
        dispatch(
          setUser({
            ...currentUser,
            sellerStatus: "pending",
          })
        );
      }

      return {
        success: true,
      };

    } catch(error) {
      dispatch(
        setSellerError(error.response?.data?.message)
      );

      return {
        success: false,
        message:error.response?.data?.message || "Application Failed",
      };

    } finally {
      dispatch(setSellerLoading(false));
    }
  };
};

export const updateSellerProfileThunk = (formData) => {
  return async (dispatch, getState) => {
    try {
      const response = await updateSellerProfileApi(formData);
      const sellerProfile = response.data.data;

      dispatch(setSellerProfile(sellerProfile));

      const currentUser = getState().auth.user;
      if (currentUser && sellerProfile?.applicationStatus) {
        dispatch(
          setUser({
            ...currentUser,
            sellerStatus: sellerProfile.applicationStatus,
          })
        );
      }

      return {
        success: true,
        data: sellerProfile,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Seller profile update failed",
      };
    }
  };
};

export const approveApplicationThunk = (id) => {
  return async(dispatch) => {
    try {
      dispatch(setSellerLoading(true));

      const response =  await approveApplicationApi(id);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      }
    } finally { 
      dispatch(setSellerLoading(false));   
    }
  };
};

export const rejectApplicationThunk = ({ id, reason }) => {
  return async (dispatch) => {
    try {
      dispatch(setSellerLoading(true));
 
      await rejectApplicationApi(id, reason);
      
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    } finally {
      dispatch(setSellerLoading(false));
    }
  };
};

export const fetchApprovedApplicationsThunk = () => {
  return async(dispatch) => {
    try {
      dispatch(setSellerLoading(true));

      const response = await getApprovedApplicationsApi();
      
      dispatch(setApprovedApplications(
        response.data.data
      ));

      return {
        success: true,
      }
    } catch( error ){
      return {
        success: false,
        message: error.response?.data?.message,
      };
    } finally {
      dispatch(setSellerLoading(false));
    }
  }
}

export const getAllUsersThunk = () => {
  return async(dispatch) => {
    try {
      dispatch(setSellerLoading(true));
      
      const response = await getAllUsersApi();

      dispatch(setAllUsers(response.data.data));

    } catch (error){
      dispatch(setSellerError(error.response?.data?.message));

    } finally {
      dispatch(setSellerLoading(false));
    }
  }
}

export const fetchSuperAdminDashboardThunk = () => {
  return async(dispatch) => {
    try {
      dispatch(setSellerLoading(true));
      
      const response = await getSuperAdminDashboardApi();

      dispatch(setSuperAdminDashboard(response.data.data));

    } catch (error){
      dispatch(setSellerError(error.response?.data?.message));

    } finally {
      dispatch(setSellerLoading(false));
    }
  };
};


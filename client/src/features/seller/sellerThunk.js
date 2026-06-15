import { 
  setSellerError, 
  setSellerProfile, 
  setSellerLoading, 
  setPendingApplications,
  setSuperAdminDashboard, setApprovedApplications,
  setAllUsers, 
} from "./sellerSlice.js";

import { 
  getPendingApplicationsApi, getSellerProfileApi, 
  applySellerProfileApi, 
  rejectApplicationApi, 
  approveApplicationApi, getSuperAdminDashboardApi,getApprovedApplicationsApi,
  getAllUsersApi,
} from "../../api/sellerApi.js";

import { setLoading } from "../auth/authSlice.js";

export const fetchSellerProfileThunk = () => {
  return async (dispatch) => {
    try {
      dispatch(setSellerLoading(true));
      const response = await getSellerProfileApi();
      
      dispatch(
        setSellerProfile(response.data.data)
      );

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
  return async(dispatch) => {
    try {
      dispatch(setSellerLoading(true));
      const response = await applySellerProfileApi(formData);
      
      dispatch(
        setSellerProfile(response.data.data)
      );

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

export const approveApplicationThunk = (id) => {
  return async(dispatch) => {
    try {
      dispatch(setSellerLoading(true));

      const response =  await approveApplicationApi(id);

      dispatch(fetchPendingApplicationThunk());
      dispatch(fetchSellerProfileThunk());
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
 
      await rejectApplicationApi(id, reason);
      
      dispatch(fetchPendingApplicationThunk());
      
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
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


import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  sellerProfile: null,
  loading: false,
  error: null,
  pendingApplications: [],
  approvedApplications: [],
  rejectedApplications: [],
  allUsers: [],
  superAdminDashboard: {
    summary: {},
    revenueChart: [],
    sellerStatusStats: [],
    topCategories: [],
    topSellers: [],
  },
}

const sellerSlice = createSlice({
  name: "sellers",
  initialState,
  reducers: {

    setSellerProfile: (state, action) => {
      state.sellerProfile = action.payload;
    },

    setSellerLoading: (state, action) => {
      state.loading = action.payload;
    },

    setSellerError: (state, action) => {
      state.error = action.payload;
    },

    resetSellerState: (state) => {
      state.sellerProfile = null;
      state.loading = false;
      state.error = null;
    },

    setAllUsers: (state,action) => {
      state.allUsers = action.payload;
    },

    setPendingApplications: (state,action) => {
      state.pendingApplications = action.payload;
    },

    setApprovedApplications: (state,action) => {
      state.approvedApplications = action.payload;
    },

    setRejectedApplications: (state,action) => {
      state.rejectedApplications = action.payload;
    },
    setSuperAdminDashboard : (state, action) => {
      state.superAdminDashboard = action.payload;
    }
  },

});

export const { 
  setSellerError, 
  setSellerLoading, 
  setSellerProfile, 
  resetSellerState, 
  setRejectedApplications, 
  setApprovedApplications, 
  setPendingApplications, 
  setSuperAdminDashboard, 
  setAllUsers, 
} = sellerSlice.actions;

export default sellerSlice.reducer;
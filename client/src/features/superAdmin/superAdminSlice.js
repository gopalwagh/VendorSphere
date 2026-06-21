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
    recentPendingApplications: [],
    revenueChart: [],
    sellerStatusStats: [],
    topCategories: [],
    topSellers: [],
  },
}

const superAdminSlice = createSlice({
  name: "superAdmin",
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

    resetSellerState: () => ({
      sellerProfile: null,
      loading: false,
      error: null,
      pendingApplications: [],
      approvedApplications: [],
      rejectedApplications: [],
      allUsers: [],
      superAdminDashboard: {
        summary: {},
        recentPendingApplications: [],
        revenueChart: [],
        sellerStatusStats: [],
        topCategories: [],
        topSellers: [],
      },
    }),

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
} = superAdminSlice.actions;

export default superAdminSlice.reducer;

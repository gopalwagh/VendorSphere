import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  analytics: {
    summary: {},
    revenueChart: [],
    ordersChart: [],
    topCategories: [],
    bestCategory: {},
    topProducts: [],
    topRatedProducts: [],
  },
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetAnalytics: (state) => {
      state.analytics = initialState.analytics;
      state.error = null;
    },
  },
});

export const { setAnalytics, setLoading, setError, resetAnalytics } =
  adminSlice.actions;

export default adminSlice.reducer;

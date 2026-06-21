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

const sellerSlice = createSlice({
  name: "seller",
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
      state.loading = false;
    },
  },
});

export const { setAnalytics, setLoading, setError, resetAnalytics } =
  sellerSlice.actions;

export default sellerSlice.reducer;

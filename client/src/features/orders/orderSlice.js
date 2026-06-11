import { createSlice } from "@reduxjs/toolkit";
import { fetchMyOrdersThunk, } from "./orderThunk";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  adminOrders: [],
  dashboard: {
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  },
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setAdminOrders: (state, action) => {
      state.adminOrders = action.payload;
    },
    setDashboard: (state, action) => {
      state.dashboard = action.payload;
    },
    setLoading: (state, action) =>{
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrdersThunk.pending,(state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrdersThunk.rejected,(state)=> {
        state.loading = false;
      });
  },
});

export const { setAdminOrders, setLoading, setDashboard } = orderSlice.actions;
export default orderSlice.reducer;
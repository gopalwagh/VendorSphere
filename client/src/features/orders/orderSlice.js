import { createSlice } from "@reduxjs/toolkit";
import { fetchMyOrdersThunk } from "./orderThunk";

const initialState = {
  orders: [],
  loading: false,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
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

export default orderSlice.reducer;
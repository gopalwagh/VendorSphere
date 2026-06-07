import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  coupon: null,
  loading: false,
}

const couponSlice = createSlice({
  name:  "coupon",
  initialState,
  reducers: {
    setCoupon: (state, action) => {
      state.coupon = action.payload;
    },
    clearCoupon: (state) => {
      state.coupon = null;
    },
  },
});

export const { setCoupon, clearCoupon } =couponSlice.actions;

export default couponSlice.reducer;
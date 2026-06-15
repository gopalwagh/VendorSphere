import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  coupon: null,
  allCoupons: [],
  loading: false,
}

const couponSlice = createSlice({
  name:  "coupon",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCoupon: (state, action) => {
      state.coupon = action.payload;
    },

    setAllCoupons: (state, action) => {
      state.allCoupons = action.payload;
    },

    clearCoupon: (state) => {
      state.coupon = null;
    },
  },
});

export const { 
  setLoading,
  setCoupon, 
  clearCoupon, 
  setAllCoupons 
} = couponSlice.actions;

export default couponSlice.reducer;
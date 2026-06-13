import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  totalItems: 0,
  subtotal: 0,
  loading: false,
  addToCartLoading: false,
  fetchCart: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state,action) => {
      const cart = action.payload?.cart;
      const summary = action.payload?.summary;

      state.cartItems = cart?.items || [];
      state.totalItems = summary?.totalItems || 0;
      state.subtotal = summary?.subtotal || 0;
    },

    setFetchCart: (state, action) => {
      state.fetchCart = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setAddToCartLoading: (state, action) => {
      state.addToCartLoading = action.payload;
    },

    clearCart:(state) => {
      state.cartItems = [];
      state.subtotal = 0;
      state.totalItems = 0;
    }
  },
}); 

export const { setCart, setLoading, setAddToCartLoading, setFetchCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
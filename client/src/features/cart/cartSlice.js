import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  totalItems: 0,
  subtotal: 0,
  loading: false,
  addToCartLoading: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state,action) => {
      state.cartItems = action.payload.cart.items;
      
      state.totalItems = action.payload.summary.totalItems;

      state.subtotal = action.payload.summary.subtotal;

    },

    setLoading: (state, action) => {
      state.loading = action.payload;

    },
    
    setAddToCartLoading: (state, action) => {
      state.addToCartLoading = action.payload;
    }
  },
}); 

export const { setCart, setLoading, setAddToCartLoading } = cartSlice.actions;

export default cartSlice.reducer;
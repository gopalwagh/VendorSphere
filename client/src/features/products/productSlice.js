import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedProduct: null,
  pagination: {},
  loading: false,
  error: null,
}

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProduct: (state,action) => {
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    },

    setSelectedProduct: (state,action) => {
      state.selectedProduct = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError:(state,action) => {
      state.error = action.payload;
    },
  },
});

export const { setProduct, setError, setLoading, setSelectedProduct } = productSlice.actions;

export default productSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  sellerProducts: [],
  adminProducts: [],
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

    setSellerProducts: (state, action) => {
      state.sellerProducts = action.payload;
      state.adminProducts = action.payload;
    },

    setAdminProducts: (state, action) => {
      state.sellerProducts = action.payload;
      state.adminProducts = action.payload;
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

    resetProductState: () => ({
      products: [],
      sellerProducts: [],
      adminProducts: [],
      selectedProduct: null,
      pagination: {},
      loading: false,
      error: null,
    }),
  },
});

export const {
  setProduct,
  setError,
  setLoading,
  setSelectedProduct,
  setSellerProducts,
  setAdminProducts,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;

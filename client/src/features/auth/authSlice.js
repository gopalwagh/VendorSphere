import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  fetchedUser: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState, 
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    setLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.fetchedUser = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFetchedUser:(state, action) => {
      state.fetchedUser = action.payload;
    }
  },
});

export const { setUser, setLogout, setLoading, setError, setFetchedUser } = authSlice.actions;

export default authSlice.reducer;
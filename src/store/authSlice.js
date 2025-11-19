import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,        // { name, role, group, department, phonenumber }
  token: null,       // JWT token
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart(state) {
      state.loading = true;
      state.error = null;
    },

    authSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },

    authFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;

      // remove from local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    loadUserFromStorage(state) {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (user && token) {
        state.user = JSON.parse(user);
        state.token = token;
      }
    }
  }
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logout,
  loadUserFromStorage
} = authSlice.actions;

export default authSlice.reducer;

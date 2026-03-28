import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,        // { name, role, group, department, phonenumber }
  token: null,       // JWT token
  loading: false,
  error: null,
  isAuthReady: false,
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
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      state.isAuthReady = true;  // ← Mark as ready even if no user

      if (!token || !userStr) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;

        if (Date.now() >= exp) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return;
        }

        state.token = token;
        state.user = JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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

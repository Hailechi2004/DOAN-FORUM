import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Check if token is valid on init
if (initialState.token) {
  try {
    const decoded = jwtDecode(initialState.token);
    if (decoded.exp * 1000 > Date.now()) {
      initialState.isAuthenticated = true;
      initialState.user = JSON.parse(localStorage.getItem("user") || "{}");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      initialState.token = null;
    }
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    initialState.token = null;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      // Fetch and save user roles
      if (action.payload.user.roles) {
        state.user.roleNames = action.payload.user.roles.map((r) => r.name);
      } else {
        state.user.roleNames = [];
      }

      // Save to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } =
  authSlice.actions;

export default authSlice.reducer;

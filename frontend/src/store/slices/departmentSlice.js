import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/departments");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch departments");
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  "departments/fetchDepartmentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch department");
    }
  }
);

export const fetchDepartmentMembers = createAsyncThunk(
  "departments/fetchDepartmentMembers",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/departments/${id}/members`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch members");
    }
  }
);

export const fetchDepartmentStats = createAsyncThunk(
  "departments/fetchDepartmentStats",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/departments/${id}/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch stats");
    }
  }
);

export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/departments", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create department");
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/departments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update department");
    }
  }
);

const initialState = {
  departments: [],
  currentDepartment: null,
  departmentMembers: [],
  departmentStats: null,
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
      state.departmentMembers = [];
      state.departmentStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments || action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch department by ID
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.currentDepartment = action.payload;
      })
      // Fetch members
      .addCase(fetchDepartmentMembers.fulfilled, (state, action) => {
        state.departmentMembers = action.payload.members || [];
      })
      // Fetch stats
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.departmentStats = action.payload;
      })
      // Create department
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      // Update department
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentDepartment } = departmentSlice.actions;

export default departmentSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Fetch dashboard statistics
export const fetchDashboard = createAsyncThunk(
  "analytics/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/dashboard");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

// Fetch activity trend
export const fetchActivityTrend = createAsyncThunk(
  "analytics/fetchActivityTrend",
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/analytics/activity-trend?days=${days}`
      );
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activity trend"
      );
    }
  }
);

// Fetch top users
export const fetchTopUsers = createAsyncThunk(
  "analytics/fetchTopUsers",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/analytics/top-users?limit=${limit}`
      );
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch top users"
      );
    }
  }
);

// Fetch project statistics
export const fetchProjectStats = createAsyncThunk(
  "analytics/fetchProjectStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/projects");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project stats"
      );
    }
  }
);

// Fetch task statistics
export const fetchTaskStats = createAsyncThunk(
  "analytics/fetchTaskStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/tasks");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch task stats"
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    dashboard: {
      totalUsers: 0,
      activeUsers: 0,
      totalPosts: 0,
      postsThisMonth: 0,
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      totalDepartments: 0,
      totalTeams: 0,
      files: {},
    },
    activityTrend: {
      posts: [],
      tasks: [],
    },
    topUsers: [],
    projectStats: [],
    taskStats: {
      byStatus: [],
      byPriority: [],
    },
    loading: {
      dashboard: false,
      trend: false,
      users: false,
      projects: false,
      tasks: false,
    },
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload;
      })
      // Activity Trend
      .addCase(fetchActivityTrend.pending, (state) => {
        state.loading.trend = true;
        state.error = null;
      })
      .addCase(fetchActivityTrend.fulfilled, (state, action) => {
        state.loading.trend = false;
        state.activityTrend = action.payload;
      })
      .addCase(fetchActivityTrend.rejected, (state, action) => {
        state.loading.trend = false;
        state.error = action.payload;
      })
      // Top Users
      .addCase(fetchTopUsers.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(fetchTopUsers.fulfilled, (state, action) => {
        state.loading.users = false;
        state.topUsers = action.payload;
      })
      .addCase(fetchTopUsers.rejected, (state, action) => {
        state.loading.users = false;
        state.error = action.payload;
      })
      // Project Stats
      .addCase(fetchProjectStats.pending, (state) => {
        state.loading.projects = true;
        state.error = null;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.loading.projects = false;
        state.projectStats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.loading.projects = false;
        state.error = action.payload;
      })
      // Task Stats
      .addCase(fetchTaskStats.pending, (state) => {
        state.loading.tasks = true;
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.taskStats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;

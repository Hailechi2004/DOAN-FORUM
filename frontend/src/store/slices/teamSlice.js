import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/teams", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch teams");
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  "teams/fetchTeamById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch team");
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  "teams/fetchTeamMembers",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/teams/${id}/members`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch members");
    }
  }
);

export const fetchTeamStats = createAsyncThunk(
  "teams/fetchTeamStats",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/teams/${id}/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch stats");
    }
  }
);

export const createTeam = createAsyncThunk(
  "teams/createTeam",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/teams", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create team");
    }
  }
);

export const updateTeam = createAsyncThunk(
  "teams/updateTeam",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/teams/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update team");
    }
  }
);

const initialState = {
  teams: [],
  currentTeam: null,
  teamMembers: [],
  teamStats: null,
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
      state.teamMembers = [];
      state.teamStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.teams || action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch team by ID
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.currentTeam = action.payload;
      })
      // Fetch members
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.teamMembers = action.payload.members || [];
      })
      // Fetch stats
      .addCase(fetchTeamStats.fulfilled, (state, action) => {
        state.teamStats = action.payload;
      })
      // Create team
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      // Update team
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentTeam } = teamSlice.actions;

export default teamSlice.reducer;

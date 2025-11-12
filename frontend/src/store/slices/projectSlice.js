import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/projects", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch projects");
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch project");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/projects", projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create project");
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update project");
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete project");
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  "projects/fetchProjectMembers",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/projects/${id}/members`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch members");
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  projectMembers: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  filters: {
    department_id: null,
    status: null,
    search: "",
  },
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.projectMembers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        console.log("✅ Raw payload:", action.payload);
        console.log("✅ Payload type:", typeof action.payload);
        console.log("✅ Is array?:", Array.isArray(action.payload));

        state.loading = false;

        // Check if payload is already the array (from interceptor unwrapping)
        let projectsData = [];
        let paginationData = { page: 1, limit: 20, total: 0, totalPages: 0 };

        if (Array.isArray(action.payload)) {
          // Payload is already array of projects
          projectsData = action.payload;
        } else if (action.payload?.data) {
          // Payload is { data: [...], pagination: {...} }
          projectsData = action.payload.data;
          paginationData = action.payload.pagination || paginationData;
        }

        console.log("� Final projects:", projectsData.length, "items");
        state.projects = projectsData;
        state.pagination = paginationData;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch project by ID
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.currentProject = action.payload.data || action.payload;
      })
      // Create project
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload.data || action.payload);
      })
      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const project = action.payload.data || action.payload;
        const index = state.projects.findIndex((p) => p.id === project.id);
        if (index !== -1) {
          state.projects[index] = project;
        }
        if (state.currentProject?.id === project.id) {
          state.currentProject = project;
        }
      })
      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      // Fetch members
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.projectMembers = action.payload.members || [];
      });
  },
});

export const { setFilters, clearCurrentProject } = projectSlice.actions;

export default projectSlice.reducer;

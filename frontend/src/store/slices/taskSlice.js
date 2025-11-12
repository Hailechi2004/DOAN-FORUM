import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/tasks", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch tasks");
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch task");
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/tasks", taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create task");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update task");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete task");
    }
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  filters: {
    project_id: null,
    status: null,
    priority: null,
    assigned_to: null,
    search: "",
  },
  // Kanban board organization
  kanbanColumns: {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  },
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    organizeKanban: (state) => {
      // Organize tasks into Kanban columns
      state.kanbanColumns = {
        todo: state.tasks.filter((t) => t.status === "todo"),
        in_progress: state.tasks.filter((t) => t.status === "in_progress"),
        review: state.tasks.filter((t) => t.status === "review"),
        done: state.tasks.filter((t) => t.status === "done"),
      };
    },
    moveTask: (state, action) => {
      const { taskId, newStatus } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = newStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch task by ID
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentTask = action.payload;
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setFilters, clearCurrentTask, organizeKanban, moveTask } =
  taskSlice.actions;

export default taskSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/notifications", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch notifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch unread count");
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark as read");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put("/notifications/read-all");
      return true;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark all as read");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete notification");
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count || 0;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload
        );
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.is_read = true;
        });
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload
        );
        if (notification && !notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      });
  },
});

export const { addNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;

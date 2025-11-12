import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/events", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event");
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/events", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create event");
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/events/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update event");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/events/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete event");
    }
  }
);

export const fetchEventAttendees = createAsyncThunk(
  "events/fetchEventAttendees",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/events/${id}/attendees`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch attendees");
    }
  }
);

export const addEventAttendee = createAsyncThunk(
  "events/addEventAttendee",
  async ({ eventId, userId, status = "going" }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/events/${eventId}/attendees`,
        {
          user_id: userId,
          status,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add attendee");
    }
  }
);

export const removeEventAttendee = createAsyncThunk(
  "events/removeEventAttendee",
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/events/${eventId}/attendees/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove attendee");
    }
  }
);

const initialState = {
  events: [],
  currentEvent: null,
  attendees: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,
  error: null,
  filters: {
    start_date: null,
    end_date: null,
    event_type: null,
  },
};

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.attendees = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events =
          action.payload.data?.events ||
          action.payload.events ||
          action.payload;
        state.pagination =
          action.payload.data?.pagination ||
          action.payload.pagination ||
          state.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch event by ID
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEvent = action.payload.data || action.payload;
      })
      // Create event
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.push(action.payload.data || action.payload);
      })
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const updatedEvent = action.payload.data || action.payload;
        const index = state.events.findIndex((e) => e.id === updatedEvent.id);
        if (index !== -1) {
          state.events[index] = updatedEvent;
        }
      })
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e.id !== action.payload);
      })
      // Fetch attendees
      .addCase(fetchEventAttendees.fulfilled, (state, action) => {
        state.attendees = action.payload.data || action.payload.attendees || [];
      })
      // Add attendee
      .addCase(addEventAttendee.fulfilled, (state) => {
        // Refresh will be handled by fetchEventAttendees
      })
      // Remove attendee
      .addCase(removeEventAttendee.fulfilled, (state, action) => {
        state.attendees = state.attendees.filter(
          (a) => a.id !== action.payload
        );
      });
  },
});

export const { setFilters, clearCurrentEvent } = eventSlice.actions;

export default eventSlice.reducer;

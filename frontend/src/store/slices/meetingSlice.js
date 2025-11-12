import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axios";

// Async thunks for API calls
export const fetchMeetings = createAsyncThunk(
  "meetings/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.organizer_id)
        params.append("organizer_id", filters.organizer_id);
      if (filters.department_id)
        params.append("department_id", filters.department_id);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await api.get(`/meetings?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMeetingById = createAsyncThunk(
  "meetings/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meetings/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMeeting = createAsyncThunk(
  "meetings/create",
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await api.post("/meetings", meetingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMeeting = createAsyncThunk(
  "meetings/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/meetings/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  "meetings/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/meetings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelMeeting = createAsyncThunk(
  "meetings/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/meetings/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAttendees = createAsyncThunk(
  "meetings/fetchAttendees",
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meetings/${meetingId}/attendees`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addAttendees = createAsyncThunk(
  "meetings/addAttendees",
  async ({ meetingId, userIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/meetings/${meetingId}/attendees`, {
        user_ids: userIds,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeAttendee = createAsyncThunk(
  "meetings/removeAttendee",
  async ({ meetingId, userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/meetings/${meetingId}/attendees/${userId}`);
      return { meetingId, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const respondToInvitation = createAsyncThunk(
  "meetings/respondToInvitation",
  async ({ meetingId, userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/meetings/${meetingId}/attendees/${userId}/respond`,
        { status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAttachments = createAsyncThunk(
  "meetings/fetchAttachments",
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/meetings/${meetingId}/attachments`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addAttachment = createAsyncThunk(
  "meetings/addAttachment",
  async ({ meetingId, fileId, description }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/meetings/${meetingId}/attachments`, {
        file_id: fileId,
        description,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeAttachment = createAsyncThunk(
  "meetings/removeAttachment",
  async ({ meetingId, attachmentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/meetings/${meetingId}/attachments/${attachmentId}`);
      return { meetingId, attachmentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const meetingSlice = createSlice({
  name: "meetings",
  initialState: {
    meetings: [],
    currentMeeting: null,
    attendees: [],
    attachments: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentMeeting: (state) => {
      state.currentMeeting = null;
      state.attendees = [];
      state.attachments = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meetings
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings =
          action.payload.data?.meetings ||
          action.payload.meetings ||
          action.payload;
        state.pagination =
          action.payload.data?.pagination ||
          action.payload.pagination ||
          state.pagination;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch meeting by ID
      .addCase(fetchMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMeeting = action.payload.data || action.payload;
      })
      .addCase(fetchMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const newMeeting = action.payload.data || action.payload;
        state.meetings.unshift(newMeeting);
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update meeting
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMeeting = action.payload.data || action.payload;
        const index = state.meetings.findIndex(
          (m) => m.id === updatedMeeting.id
        );
        if (index !== -1) {
          state.meetings[index] = updatedMeeting;
        }
        if (state.currentMeeting?.id === updatedMeeting.id) {
          state.currentMeeting = updatedMeeting;
        }
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = state.meetings.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel meeting
      .addCase(cancelMeeting.fulfilled, (state, action) => {
        const cancelledMeeting = action.payload.data || action.payload;
        if (cancelledMeeting && cancelledMeeting.id) {
          const index = state.meetings.findIndex(
            (m) => m.id === cancelledMeeting.id
          );
          if (index !== -1) {
            state.meetings[index] = cancelledMeeting;
          }
        }
      })

      // Fetch attendees
      .addCase(fetchAttendees.fulfilled, (state, action) => {
        state.attendees =
          action.payload.data || action.payload.attendees || action.payload;
      })

      // Fetch attachments
      .addCase(fetchAttachments.fulfilled, (state, action) => {
        state.attachments =
          action.payload.data || action.payload.attachments || action.payload;
      });
  },
});

export const { clearCurrentMeeting, clearError } = meetingSlice.actions;
export default meetingSlice.reducer;

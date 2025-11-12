import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/messages/conversations");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch conversations");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ conversationId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/messages/conversations/${conversationId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch messages");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/messages", messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  "messages/markAsRead",
  async (messageId, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/messages/${messageId}/read`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark as read");
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "messages/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete message");
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  typingUsers: [], // Users currently typing
  unreadMessagesCount: 0,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
      state.messages = [];
    },
    addMessage: (state, action) => {
      // Add new message from WebSocket
      state.messages.push(action.payload);

      // Update conversation list
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversation_id
      );
      if (conversation) {
        conversation.last_message = action.payload.content;
        conversation.last_message_at = action.payload.created_at;
        if (!action.payload.is_read) {
          conversation.unread_count = (conversation.unread_count || 0) + 1;
        }
      }
    },
    updateTypingStatus: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typingUsers.includes(userId)) {
          state.typingUsers.push(userId);
        }
      } else {
        state.typingUsers = state.typingUsers.filter((id) => id !== userId);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations || [];
        // Calculate total unread
        state.unreadMessagesCount = state.conversations.reduce(
          (sum, conv) => sum + (conv.unread_count || 0),
          0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      // Mark as read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const message = state.messages.find((m) => m.id === action.payload);
        if (message) {
          message.is_read = true;
        }
      })
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter((m) => m.id !== action.payload);
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  updateTypingStatus,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;

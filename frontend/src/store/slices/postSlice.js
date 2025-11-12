import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/posts", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch posts");
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch post");
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      // Check if postData is FormData (for image uploads)
      const config =
        postData instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

      const response = await axiosInstance.post("/posts", postData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create post");
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/posts/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update post");
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/posts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete post");
    }
  }
);

export const reactToPost = createAsyncThunk(
  "posts/reactToPost",
  async ({ id, reactionType }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/posts/${id}/reactions`, {
        reaction_type: reactionType,
      });
      return { postId: id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to react to post");
    }
  }
);

export const createComment = createAsyncThunk(
  "posts/createComment",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/comments", {
        post_id: postId,
        content: content,
      });
      console.log("✅ createComment response:", response.data.data);
      return { postId, comment: response.data.data };
    } catch (error) {
      console.error("❌ createComment error:", error);
      return rejectWithValue(error.message || "Failed to create comment");
    }
  }
);

// Fetch comments for a post
export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/comments/post/${postId}`);
      console.log("✅ fetchComments response:", response.data.data);
      return { postId, comments: response.data.data || [] };
    } catch (error) {
      console.error("❌ fetchComments error:", error);
      return rejectWithValue(error.message || "Failed to fetch comments");
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  filters: {
    category_id: null,
    visibility: null,
    search: "",
  },
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        console.log("✅ fetchPosts.fulfilled:", action.payload);
        // Backend returns { success, data: { posts, pagination } }
        const responseData = action.payload.data || action.payload;
        if (responseData.posts) {
          // New structure: { data: { posts: [], pagination: {} } }
          state.posts =
            responseData.posts.map((post) => ({
              ...post,
              comments: post.comments || [],
            })) || [];
          state.pagination = responseData.pagination || initialState.pagination;
        } else if (Array.isArray(responseData)) {
          // Old structure: { data: [] }
          state.posts = responseData.map((post) => ({
            ...post,
            comments: post.comments || [],
          }));
        } else {
          // Fallback
          state.posts = [];
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        console.log("✅ createPost.fulfilled:", action.payload);
        // Backend returns { success, message, data: post }
        const newPost = action.payload.data || action.payload;
        state.posts.unshift(newPost);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      // React to post
      .addCase(reactToPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload.postId);
        if (post && action.payload.reactions) {
          post.reactions = action.payload.reactions;
          post.reaction_counts = action.payload.reaction_counts;
        }
      })
      // Create comment
      .addCase(createComment.fulfilled, (state, action) => {
        console.log("📝 Adding comment to post:", action.payload);
        const post = state.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          if (!post.comments) {
            post.comments = [];
          }
          post.comments.push(action.payload.comment);
          post.comment_count = (post.comment_count || 0) + 1;
        }
        if (state.currentPost?.id === action.payload.postId) {
          if (!state.currentPost.comments) {
            state.currentPost.comments = [];
          }
          state.currentPost.comments.push(action.payload.comment);
          state.currentPost.comment_count =
            (state.currentPost.comment_count || 0) + 1;
        }
      })
      // Fetch comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        console.log("📝 Fetched comments for post:", action.payload);
        const post = state.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          post.comments = action.payload.comments;
        }
        if (state.currentPost?.id === action.payload.postId) {
          state.currentPost.comments = action.payload.comments;
        }
      });
  },
});

export const { setFilters, clearCurrentPost, resetPosts } = postSlice.actions;

export default postSlice.reducer;

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    LOGOUT: "/auth/logout",
  },

  // Users
  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
    PROFILE: {
      ME: "/users/profile/me",
      PASSWORD: "/users/profile/password",
    },
    ROLES: (userId) => `/users/${userId}/roles`,
  },

  // Posts
  POSTS: {
    BASE: "/posts",
    BY_ID: (id) => `/posts/${id}`,
    REACTIONS: (id) => `/posts/${id}/reactions`,
  },

  // Comments
  COMMENTS: {
    BASE: "/comments",
    BY_ID: (id) => `/comments/${id}`,
    BY_POST: (postId) => `/comments/post/${postId}`,
  },

  // Messages
  MESSAGES: {
    CONVERSATIONS: "/messages/conversations",
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
  },

  // Departments
  DEPARTMENTS: {
    BASE: "/departments",
    BY_ID: (id) => `/departments/${id}`,
    STATS: (id) => `/departments/${id}/stats`,
  },

  // Teams
  TEAMS: {
    BASE: "/teams",
    BY_ID: (id) => `/teams/${id}`,
    STATS: (id) => `/teams/${id}/stats`,
  },

  // Categories
  CATEGORIES: {
    BASE: "/categories",
    BY_ID: (id) => `/categories/${id}`,
  },

  // Files
  FILES: {
    BASE: "/files",
  },

  // Projects
  PROJECTS: {
    BASE: "/projects",
    BY_ID: (id) => `/projects/${id}`,
    MEMBERS: (id) => `/projects/${id}/members`,
  },

  // Tasks
  TASKS: {
    BASE: "/tasks",
    BY_ID: (id) => `/tasks/${id}`,
    COMMENTS: (id) => `/tasks/${id}/comments`,
  },

  // Events
  EVENTS: {
    BASE: "/events",
    BY_ID: (id) => `/events/${id}`,
    ATTENDEES: (id) => `/events/${id}/attendees`,
  },

  // Polls
  POLLS: {
    BASE: "/polls",
    BY_ID: (id) => `/polls/${id}`,
    RESULTS: (id) => `/polls/${id}/results`,
  },

  // Bookmarks
  BOOKMARKS: {
    BASE: "/bookmarks",
  },

  // Meetings
  MEETINGS: {
    BASE: "/meetings",
    BY_ID: (id) => `/meetings/${id}`,
    PARTICIPANTS: (id) => `/meetings/${id}/participants`,
  },

  // Search
  SEARCH: {
    GLOBAL: "/search",
    POSTS: "/search/posts",
    USERS: "/search/users",
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    ACTIVITY_TREND: "/analytics/activity-trend",
    TOP_USERS: "/analytics/top-users",
    PROJECTS: "/analytics/projects",
    TASKS: "/analytics/tasks",
  },
};

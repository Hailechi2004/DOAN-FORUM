import axiosInstance from "../utils/axios";
import { API_ENDPOINTS } from "../config/api";

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const userService = {
  // Get all users
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE, {
      params,
    });
    return response.data;
  },

  // Get user by ID
  getById: async (id) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },

  // Update user
  update: async (id, userData) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.USERS.BY_ID(id),
      userData
    );
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },

  // Get my profile
  getMyProfile: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.PROFILE.ME);
    return response.data;
  },

  // Update my profile
  updateMyProfile: async (profileData) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.USERS.PROFILE.ME,
      profileData
    );
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.USERS.PROFILE.PASSWORD,
      passwordData
    );
    return response.data;
  },

  // Assign role to user
  assignRole: async (userId, roleId) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.USERS.ROLES(userId),
      { role_id: roleId }
    );
    return response.data;
  },

  // Remove role from user
  removeRole: async (userId, roleId) => {
    const response = await axiosInstance.delete(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/roles/${roleId}`
    );
    return response.data;
  },
};

export const postService = {
  // Get all posts
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.POSTS.BASE, {
      params,
    });
    return response.data;
  },

  // Get post by ID
  getById: async (id) => {
    const response = await axiosInstance.get(API_ENDPOINTS.POSTS.BY_ID(id));
    return response.data;
  },

  // Create post
  create: async (postData) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.POSTS.BASE,
      postData
    );
    return response.data;
  },

  // Update post
  update: async (id, postData) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.POSTS.BY_ID(id),
      postData
    );
    return response.data;
  },

  // React to post
  react: async (id, reactionType) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.POSTS.REACTIONS(id),
      {
        reaction_type: reactionType,
      }
    );
    return response.data;
  },
};

export const departmentService = {
  // Get all departments
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.DEPARTMENTS.BASE, {
      params,
    });
    return response.data;
  },

  // Get department by ID
  getById: async (id) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id)
    );
    return response.data;
  },

  // Create department
  create: async (data) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      data
    );
    return response.data;
  },

  // Update department
  update: async (id, data) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id),
      data
    );
    return response.data;
  },

  // Delete department
  delete: async (id) => {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id)
    );
    return response.data;
  },

  // Get stats
  getStats: async (id) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.DEPARTMENTS.STATS(id)
    );
    return response.data;
  },
};

export const teamService = {
  // Get all teams
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.TEAMS.BASE, {
      params,
    });
    return response.data;
  },

  // Get team by ID
  getById: async (id) => {
    const response = await axiosInstance.get(API_ENDPOINTS.TEAMS.BY_ID(id));
    return response.data;
  },

  // Create team
  create: async (data) => {
    const response = await axiosInstance.post(API_ENDPOINTS.TEAMS.BASE, data);
    return response.data;
  },

  // Update team
  update: async (id, data) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.TEAMS.BY_ID(id),
      data
    );
    return response.data;
  },

  // Delete team
  delete: async (id) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.TEAMS.BY_ID(id));
    return response.data;
  },

  // Get stats
  getStats: async (id) => {
    const response = await axiosInstance.get(API_ENDPOINTS.TEAMS.STATS(id));
    return response.data;
  },
};

export const projectService = {
  // Get all projects
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PROJECTS.BASE, {
      params,
    });
    return response.data;
  },

  // Get project by ID
  getById: async (id) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PROJECTS.BY_ID(id));
    return response.data;
  },

  // Create project
  create: async (data) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PROJECTS.BASE,
      data
    );
    return response.data;
  },

  // Get members
  getMembers: async (id) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.PROJECTS.MEMBERS(id)
    );
    return response.data;
  },
};

export const analyticsService = {
  // Get dashboard stats
  getDashboard: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    return response.data;
  },

  // Get activity trend
  getActivityTrend: async (days = 7) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.ANALYTICS.ACTIVITY_TREND,
      {
        params: { days },
      }
    );
    return response.data;
  },

  // Get top users
  getTopUsers: async (limit = 10, metric = "posts") => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.ANALYTICS.TOP_USERS,
      {
        params: { limit, metric },
      }
    );
    return response.data;
  },
};

export const roleService = {
  // Get all roles
  getAll: async () => {
    const response = await axiosInstance.get("/roles");
    return response.data;
  },
};

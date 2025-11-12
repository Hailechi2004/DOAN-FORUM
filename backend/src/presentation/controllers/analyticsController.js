const Analytics = require("../../models/Analytics");
const { ApiError, ApiResponse } = require("../../utils/apiHelpers");

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.roles && req.user.roles.includes("admin");

      const stats = await Analytics.getDashboardStats(userId, isAdmin);
      ApiResponse.success(res, stats, "Dashboard stats retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getActivityTrend(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const trend = await Analytics.getActivityTrend(parseInt(days));
      ApiResponse.success(res, trend, "Activity trend retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getTopUsers(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const users = await Analytics.getTopUsers(parseInt(limit));
      ApiResponse.success(res, users, "Top users retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getProjectStats(req, res, next) {
    try {
      const stats = await Analytics.getProjectStats();
      ApiResponse.success(res, stats, "Project stats retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getTaskStats(req, res, next) {
    try {
      const stats = await Analytics.getTaskStats();
      ApiResponse.success(res, stats, "Task stats retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();

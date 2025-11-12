const ProjectNotification = require("../../models/ProjectNotification");

class ProjectNotificationController {
  // Get my notifications
  async getMyNotifications(req, res) {
    try {
      const { is_read, limit } = req.query;

      const isRead =
        is_read === "true" ? true : is_read === "false" ? false : null;
      const limitNum = parseInt(limit) || 50;

      const notifications = await ProjectNotification.getUserNotifications(
        req.user.id,
        isRead,
        limitNum
      );

      const unreadCount = await ProjectNotification.getUnreadCount(req.user.id);

      res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch notifications",
      });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const count = await ProjectNotification.getUnreadCount(req.user.id);

      res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch count",
      });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      await ProjectNotification.markAsRead(id, req.user.id);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to mark notification",
      });
    }
  }

  // Mark all as read
  async markAllAsRead(req, res) {
    try {
      await ProjectNotification.markAllAsRead(req.user.id);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to mark notifications",
      });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      await ProjectNotification.delete(id, req.user.id);

      res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete notification",
      });
    }
  }
}

module.exports = new ProjectNotificationController();

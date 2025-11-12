const { ApiResponse } = require("../../utils/apiHelpers");
const container = require("../../container");
const NotificationModel = require("../../models/Notification");

class NotificationController {
  constructor() {
    this.useCases = container.getNotificationUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getUnread = this.getUnread.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
  }

  async create(req, res, next) {
    try {
      const notification = await this.useCases.createNotification.execute(
        req.body
      );
      ApiResponse.success(
        res,
        notification,
        "Notification created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const notifications = await this.useCases.getAllNotifications.execute({
        user_id: req.user.id,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0,
      });
      ApiResponse.success(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const notification = await this.useCases.getNotificationById.execute(
        req.params.id
      );
      ApiResponse.success(res, notification);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const notification = await this.useCases.updateNotification.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(
        res,
        notification,
        "Notification updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteNotification.execute(req.params.id);
      ApiResponse.success(res, null, "Notification deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getUnread(req, res, next) {
    try {
      const count = await NotificationModel.getUnreadCount(req.user.id);
      ApiResponse.success(res, { count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      await NotificationModel.markAsRead(req.params.id);
      ApiResponse.success(res, null, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await NotificationModel.markAllAsRead(req.user.id);
      ApiResponse.success(res, null, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();

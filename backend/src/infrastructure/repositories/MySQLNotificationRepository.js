const INotificationRepository = require("../../domain/repositories/INotificationRepository");
const Notification = require("../../domain/entities/Notification");
const NotificationModel = require("../../models/Notification");

class MySQLNotificationRepository extends INotificationRepository {
  async create(data) {
    const result = await NotificationModel.create(data);
    return new Notification(result);
  }

  async findById(id) {
    const result = await NotificationModel.findById(id);
    return result ? new Notification(result) : null;
  }

  async getAll(filters = {}) {
    const { user_id, limit = 20, offset = 0 } = filters;
    if (!user_id) {
      throw new Error("user_id is required");
    }
    const result = await NotificationModel.getUserNotifications(
      user_id,
      limit,
      offset
    );
    return Array.isArray(result) ? result.map((r) => new Notification(r)) : [];
  }

  async update(id, data) {
    const result = await NotificationModel.update(id, data);
    return result ? new Notification(result) : null;
  }

  async delete(id) {
    return await NotificationModel.delete(id);
  }
}

module.exports = MySQLNotificationRepository;

const db = require("../config/database");

class NotificationModel {
  async create(notificationData) {
    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, content, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        notificationData.user_id,
        notificationData.actor_id || null,
        notificationData.type,
        notificationData.target_type || null,
        notificationData.target_id || null,
        notificationData.content,
        JSON.stringify(notificationData.payload || {}),
      ]
    );
    return result.insertId;
  }

  async getUserNotifications(userId, limit = 20, offset = 0) {
    const [rows] = await db.query(
      `SELECT n.*, u.username as actor_name, prof.full_name as actor_full_name,
              prof.avatar_url as actor_avatar
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  }

  async getUnread(userId) {
    const [rows] = await db.execute(
      `SELECT n.*, u.username as actor_name, prof.full_name as actor_full_name,
              prof.avatar_url as actor_avatar
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       WHERE n.user_id = ? AND n.is_read = FALSE
       ORDER BY n.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async getUnreadCount(userId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
    return rows[0].count;
  }

  async markAsRead(id, userId) {
    await db.execute(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  }

  async markAllAsRead(userId) {
    await db.execute(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
  }

  async delete(id, userId) {
    await db.execute(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, [
      id,
      userId,
    ]);
  }
}

module.exports = new NotificationModel();

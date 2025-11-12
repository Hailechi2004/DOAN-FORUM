const db = require("../config/database");

class ProjectNotification {
  // Create notification for department manager
  static async create(projectId, departmentId, userId, type, title, message) {
    const [result] = await db.query(
      `INSERT INTO project_notifications 
       (project_id, department_id, user_id, type, title, message) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, departmentId, userId, type, title, message]
    );

    return result;
  }

  // Notify all department managers about project assignment
  static async notifyDepartmentAssignment(
    projectId,
    projectName,
    departmentIds
  ) {
    const [managers] = await db.query(
      `SELECT DISTINCT d.id as department_id, d.manager_id, d.name as department_name
       FROM departments d
       WHERE d.id IN (?) AND d.manager_id IS NOT NULL`,
      [departmentIds]
    );

    const notifications = managers.map((manager) => [
      projectId,
      manager.department_id,
      manager.manager_id,
      "project_assigned",
      `New Project Assignment: ${projectName}`,
      `Your department "${manager.department_name}" has been assigned to project "${projectName}". Please assign a team and members.`,
    ]);

    if (notifications.length > 0) {
      await db.query(
        `INSERT INTO project_notifications 
         (project_id, department_id, user_id, type, title, message) 
         VALUES ?`,
        [notifications]
      );
    }

    return notifications.length;
  }

  // Get user notifications
  static async getUserNotifications(userId, isRead = null, limit = 50) {
    let query = `
      SELECT 
        pn.*,
        p.name as project_name,
        d.name as department_name
      FROM project_notifications pn
      INNER JOIN projects p ON pn.project_id = p.id
      INNER JOIN departments d ON pn.department_id = d.id
      WHERE pn.user_id = ?
    `;

    const params = [userId];

    if (isRead !== null) {
      query += ` AND pn.is_read = ?`;
      params.push(isRead);
    }

    query += ` ORDER BY pn.created_at DESC LIMIT ?`;
    params.push(limit);

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get unread count
  static async getUnreadCount(userId) {
    const [rows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM project_notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );

    return rows[0].count;
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    const [result] = await db.query(
      `UPDATE project_notifications 
       SET is_read = TRUE, read_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    return result;
  }

  // Mark all user notifications as read
  static async markAllAsRead(userId) {
    const [result] = await db.query(
      `UPDATE project_notifications 
       SET is_read = TRUE, read_at = NOW()
       WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );

    return result;
  }

  // Delete notification
  static async delete(notificationId, userId) {
    const [result] = await db.query(
      `DELETE FROM project_notifications 
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    return result;
  }

  // Get department notifications (all managers can see)
  static async getDepartmentNotifications(departmentId, limit = 50) {
    const [rows] = await db.query(
      `SELECT 
        pn.*,
        p.name as project_name,
        u.username as receiver_name
      FROM project_notifications pn
      INNER JOIN projects p ON pn.project_id = p.id
      INNER JOIN users u ON pn.user_id = u.id
      WHERE pn.department_id = ?
      ORDER BY pn.created_at DESC
      LIMIT ?`,
      [departmentId, limit]
    );

    return rows;
  }
}

module.exports = ProjectNotification;

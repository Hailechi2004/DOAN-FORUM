const db = require("../../config/database");

// Project Tasks Methods
class ProjectTasksRepository {
  async createTask(projectId, taskData) {
    const {
      title,
      description,
      assigned_to,
      status,
      priority,
      start_date,
      due_date,
      estimated_hours,
      parent_task_id,
      created_by,
    } = taskData;

    const [result] = await db.query(
      `INSERT INTO project_tasks 
       (project_id, title, description, assigned_to, status, priority, start_date, due_date, estimated_hours, parent_task_id, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        projectId,
        title,
        description || null,
        assigned_to || null,
        status || "todo",
        priority || "medium",
        start_date || null,
        due_date || null,
        estimated_hours || null,
        parent_task_id || null,
        created_by,
      ]
    );

    return this.getTaskById(result.insertId);
  }

  async getTaskById(taskId) {
    const [rows] = await db.query(
      `SELECT t.*, 
              p.full_name as assigned_to_name,
              creator.full_name as created_by_name
       FROM project_tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN users cu ON t.created_by = cu.id
       LEFT JOIN profiles creator ON cu.id = creator.user_id
       WHERE t.id = ? AND t.is_deleted = FALSE`,
      [taskId]
    );
    return rows[0];
  }

  async getProjectTasks(projectId, filters = {}) {
    const { status, assigned_to, priority } = filters;

    let query = `
      SELECT t.*, 
             p.full_name as assigned_to_name,
             p.avatar_url as assigned_to_avatar
      FROM project_tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE t.project_id = ? AND t.is_deleted = FALSE
    `;

    const params = [projectId];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }
    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    query += ` ORDER BY t.order_index ASC, t.created_at DESC`;

    const [tasks] = await db.query(query, params);
    return tasks;
  }

  async updateTask(taskId, taskData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      "title",
      "description",
      "assigned_to",
      "status",
      "priority",
      "start_date",
      "due_date",
      "estimated_hours",
      "actual_hours",
      "order_index",
    ];

    allowedFields.forEach((field) => {
      if (taskData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(taskData[field]);
      }
    });

    if (taskData.status === "completed" && !taskData.completed_at) {
      fields.push("completed_at = NOW()");
    }

    if (fields.length > 0) {
      values.push(taskId);
      await db.query(
        `UPDATE project_tasks SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }
  }

  async deleteTask(taskId) {
    await db.query(`UPDATE project_tasks SET is_deleted = TRUE WHERE id = ?`, [
      taskId,
    ]);
  }
}

// Project Milestones Methods
class ProjectMilestonesRepository {
  async createMilestone(projectId, milestoneData) {
    const { title, description, due_date, order_index } = milestoneData;

    const [result] = await db.query(
      `INSERT INTO project_milestones (project_id, title, description, due_date, order_index, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [projectId, title, description || null, due_date, order_index || 0]
    );

    return this.getMilestoneById(result.insertId);
  }

  async getMilestoneById(milestoneId) {
    const [rows] = await db.query(
      `SELECT * FROM project_milestones WHERE id = ?`,
      [milestoneId]
    );
    return rows[0];
  }

  async getProjectMilestones(projectId) {
    const [milestones] = await db.query(
      `SELECT * FROM project_milestones WHERE project_id = ? ORDER BY order_index ASC, due_date ASC`,
      [projectId]
    );
    return milestones;
  }

  async updateMilestone(milestoneId, milestoneData) {
    const fields = [];
    const values = [];

    ["title", "description", "due_date", "status", "order_index"].forEach(
      (field) => {
        if (milestoneData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(milestoneData[field]);
        }
      }
    );

    if (milestoneData.status === "completed" && !milestoneData.completed_at) {
      fields.push("completed_at = NOW()");
    }

    if (fields.length > 0) {
      values.push(milestoneId);
      await db.query(
        `UPDATE project_milestones SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }
  }

  async deleteMilestone(milestoneId) {
    await db.query(`DELETE FROM project_milestones WHERE id = ?`, [
      milestoneId,
    ]);
  }
}

// Project Comments Methods
class ProjectCommentsRepository {
  async createComment(projectId, userId, commentData) {
    const { comment, parent_id } = commentData;

    const [result] = await db.query(
      `INSERT INTO project_comments (project_id, user_id, comment, parent_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [projectId, userId, comment, parent_id || null]
    );

    return this.getCommentById(result.insertId);
  }

  async getCommentById(commentId) {
    const [rows] = await db.query(
      `SELECT c.*, p.full_name as user_name, p.avatar_url
       FROM project_comments c
       JOIN profiles p ON c.user_id = p.user_id
       WHERE c.id = ? AND c.is_deleted = FALSE`,
      [commentId]
    );
    return rows[0];
  }

  async getProjectComments(projectId) {
    const [comments] = await db.query(
      `SELECT c.*, p.full_name as user_name, p.avatar_url
       FROM project_comments c
       JOIN profiles p ON c.user_id = p.user_id
       WHERE c.project_id = ? AND c.is_deleted = FALSE
       ORDER BY c.created_at DESC`,
      [projectId]
    );
    return comments;
  }

  async updateComment(commentId, comment) {
    await db.query(
      `UPDATE project_comments SET comment = ?, updated_at = NOW() WHERE id = ?`,
      [comment, commentId]
    );
  }

  async deleteComment(commentId) {
    await db.query(
      `UPDATE project_comments SET is_deleted = TRUE WHERE id = ?`,
      [commentId]
    );
  }
}

// Project Files Methods
class ProjectFilesRepository {
  async uploadFile(projectId, userId, fileData) {
    const { file_name, file_path, file_size, file_type, description } =
      fileData;

    const [result] = await db.query(
      `INSERT INTO project_files (project_id, user_id, file_name, file_path, file_size, file_type, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        projectId,
        userId,
        file_name,
        file_path,
        file_size || null,
        file_type || null,
        description || null,
      ]
    );

    return this.getFileById(result.insertId);
  }

  async getFileById(fileId) {
    const [rows] = await db.query(
      `SELECT f.*, p.full_name as uploaded_by_name
       FROM project_files f
       JOIN profiles p ON f.user_id = p.user_id
       WHERE f.id = ? AND f.is_deleted = FALSE`,
      [fileId]
    );
    return rows[0];
  }

  async getProjectFiles(projectId) {
    const [files] = await db.query(
      `SELECT f.*, p.full_name as uploaded_by_name, p.avatar_url
       FROM project_files f
       JOIN profiles p ON f.user_id = p.user_id
       WHERE f.project_id = ? AND f.is_deleted = FALSE
       ORDER BY f.created_at DESC`,
      [projectId]
    );
    return files;
  }

  async deleteFile(fileId) {
    await db.query(`UPDATE project_files SET is_deleted = TRUE WHERE id = ?`, [
      fileId,
    ]);
  }
}

// Project Activity Logs Methods
class ProjectActivityLogsRepository {
  async logActivity(projectId, userId, activityData) {
    const {
      action,
      entity_type,
      entity_id,
      old_value,
      new_value,
      description,
    } = activityData;

    await db.query(
      `INSERT INTO project_activity_logs 
       (project_id, user_id, action, entity_type, entity_id, old_value, new_value, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        projectId,
        userId || null,
        action,
        entity_type || null,
        entity_id || null,
        old_value || null,
        new_value || null,
        description || null,
      ]
    );
  }

  async getProjectActivities(projectId, limit = 50) {
    const [activities] = await db.query(
      `SELECT a.*, p.full_name as user_name, p.avatar_url
       FROM project_activity_logs a
       LEFT JOIN profiles p ON a.user_id = p.user_id
       WHERE a.project_id = ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [projectId, limit]
    );
    return activities;
  }
}

module.exports = {
  ProjectTasksRepository: new ProjectTasksRepository(),
  ProjectMilestonesRepository: new ProjectMilestonesRepository(),
  ProjectCommentsRepository: new ProjectCommentsRepository(),
  ProjectFilesRepository: new ProjectFilesRepository(),
  ProjectActivityLogsRepository: new ProjectActivityLogsRepository(),
};

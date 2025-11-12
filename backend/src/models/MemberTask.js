const db = require("../config/database");

class MemberTask {
  // Manager: Assign task to member
  static async create(taskData) {
    const {
      department_task_id,
      user_id,
      title,
      description,
      assigned_by,
      priority = "medium",
      deadline,
      estimated_hours = 0,
    } = taskData;

    const [result] = await db.query(
      `INSERT INTO project_member_tasks 
       (department_task_id, user_id, title, description, assigned_by, priority, deadline, estimated_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        department_task_id,
        user_id,
        title,
        description,
        assigned_by,
        priority,
        deadline,
        estimated_hours,
      ]
    );

    return result.insertId;
  }

  // Get tasks by department task
  static async getByDepartmentTask(departmentTaskId) {
    const [rows] = await db.query(
      `SELECT 
        mt.*,
        u.username,
        u.email,
        p.full_name,
        p.avatar_url,
        assigner.username as assigned_by_name
      FROM project_member_tasks mt
      INNER JOIN users u ON mt.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      INNER JOIN users assigner ON mt.assigned_by = assigner.id
      WHERE mt.department_task_id = ?
      ORDER BY mt.deadline ASC, mt.priority DESC`,
      [departmentTaskId]
    );

    return rows;
  }

  // Get tasks by user
  static async getByUser(userId, status = null) {
    let query = `
      SELECT 
        mt.*,
        dt.title as department_task_title,
        dt.project_id,
        p.name as project_name,
        d.name as department_name
      FROM project_member_tasks mt
      INNER JOIN project_department_tasks dt ON mt.department_task_id = dt.id
      INNER JOIN projects p ON dt.project_id = p.id
      INNER JOIN departments d ON dt.department_id = d.id
      WHERE mt.user_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ` AND mt.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY mt.deadline ASC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get task by ID
  static async getById(taskId) {
    const [rows] = await db.query(
      `SELECT 
        mt.*,
        u.username,
        u.email,
        dt.title as department_task_title,
        dt.project_id,
        p.name as project_name
      FROM project_member_tasks mt
      INNER JOIN users u ON mt.user_id = u.id
      INNER JOIN project_department_tasks dt ON mt.department_task_id = dt.id
      INNER JOIN projects p ON dt.project_id = p.id
      WHERE mt.id = ?`,
      [taskId]
    );

    return rows[0];
  }

  // Employee: Start task
  static async start(taskId, userId) {
    const [result] = await db.query(
      `UPDATE project_member_tasks 
       SET status = 'in_progress',
           started_at = NOW(),
           updated_at = NOW()
       WHERE id = ? AND user_id = ? AND status = 'assigned'`,
      [taskId, userId]
    );

    return result;
  }

  // Employee: Update progress
  static async updateProgress(taskId, userId, progress, actualHours = null) {
    let query = `UPDATE project_member_tasks SET progress = ?, updated_at = NOW()`;
    const params = [progress];

    if (actualHours !== null) {
      query += `, actual_hours = ?`;
      params.push(actualHours);
    }

    // Note: Don't auto-complete. User must explicitly submit for approval.
    // if (progress >= 100) {
    //   query += `, status = 'completed', completed_at = NOW()`;
    // }

    query += ` WHERE id = ? AND user_id = ?`;
    params.push(taskId, userId);

    const [result] = await db.query(query, params);
    return result;
  }

  // Employee: Submit task
  static async submit(taskId, userId, notes) {
    const [result] = await db.query(
      `UPDATE project_member_tasks 
       SET status = 'submitted',
           submitted_at = NOW(),
           submission_notes = ?,
           updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [notes, taskId, userId]
    );

    return result;
  }

  // Manager: Approve task
  static async approve(taskId, managerId, notes = null) {
    const [result] = await db.query(
      `UPDATE project_member_tasks 
       SET status = 'approved',
           approved_at = NOW(),
           approved_by = ?,
           approval_notes = ?,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = ? AND status = 'submitted'`,
      [managerId, notes, taskId]
    );

    return result;
  }

  // Manager: Reject submitted task
  static async rejectSubmission(taskId, managerId, notes) {
    const [result] = await db.query(
      `UPDATE project_member_tasks 
       SET status = 'in_progress',
           approved_by = ?,
           approval_notes = ?,
           submitted_at = NULL,
           updated_at = NOW()
       WHERE id = ? AND status = 'submitted'`,
      [managerId, notes, taskId]
    );

    return result;
  }

  // Update task details
  static async update(taskId, updates) {
    const allowedFields = [
      "title",
      "description",
      "priority",
      "deadline",
      "estimated_hours",
    ];
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    fields.push("updated_at = NOW()");
    values.push(taskId);

    const [result] = await db.query(
      `UPDATE project_member_tasks SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result;
  }

  // Reassign task to another member
  static async reassign(taskId, newUserId, managerId) {
    const [result] = await db.query(
      `UPDATE project_member_tasks 
       SET user_id = ?,
           status = 'assigned',
           started_at = NULL,
           progress = 0,
           updated_at = NOW()
       WHERE id = ?`,
      [newUserId, taskId]
    );

    return result;
  }

  // Delete task
  static async delete(taskId) {
    const [result] = await db.query(
      `DELETE FROM project_member_tasks WHERE id = ?`,
      [taskId]
    );

    return result;
  }

  // Get overdue tasks
  static async getOverdue(userId = null) {
    let query = `
      SELECT 
        mt.*,
        u.username,
        dt.title as department_task_title,
        p.name as project_name
      FROM project_member_tasks mt
      INNER JOIN users u ON mt.user_id = u.id
      INNER JOIN project_department_tasks dt ON mt.department_task_id = dt.id
      INNER JOIN projects p ON dt.project_id = p.id
      WHERE mt.deadline < CURDATE() 
      AND mt.status NOT IN ('completed', 'approved')
    `;

    const params = [];

    if (userId) {
      query += ` AND mt.user_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY mt.deadline ASC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get member workload
  static async getMemberWorkload(userId) {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'completed' OR status = 'approved' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(estimated_hours) as total_estimated_hours,
        SUM(actual_hours) as total_actual_hours,
        AVG(progress) as average_progress
      FROM project_member_tasks
      WHERE user_id = ? AND status NOT IN ('completed', 'approved')`,
      [userId]
    );

    return rows[0];
  }
}

module.exports = MemberTask;

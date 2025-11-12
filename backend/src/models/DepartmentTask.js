const db = require("../config/database");

class DepartmentTask {
  // Admin: Assign task to department
  static async create(taskData) {
    const {
      project_id,
      department_id,
      title,
      description,
      assigned_by,
      priority = "medium",
      deadline,
      estimated_hours = 0,
    } = taskData;

    const [result] = await db.query(
      `INSERT INTO project_department_tasks 
       (project_id, department_id, title, description, assigned_by, priority, deadline, estimated_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        department_id,
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

  // Get tasks by project
  static async getByProject(projectId) {
    const [rows] = await db.query(
      `SELECT 
        dt.*,
        d.name as department_name,
        d.code as department_code,
        assigner.username as assigned_by_name,
        accepter.username as accepted_by_name,
        submitter.username as submitted_by_name,
        approver.username as approved_by_name,
        (SELECT COUNT(*) FROM project_member_tasks 
         WHERE department_task_id = dt.id) as member_tasks_count,
        (SELECT COUNT(*) FROM project_member_tasks 
         WHERE department_task_id = dt.id AND status = 'completed') as completed_member_tasks
      FROM project_department_tasks dt
      INNER JOIN departments d ON dt.department_id = d.id
      INNER JOIN users assigner ON dt.assigned_by = assigner.id
      LEFT JOIN users accepter ON dt.accepted_by = accepter.id
      LEFT JOIN users submitter ON dt.submitted_by = submitter.id
      LEFT JOIN users approver ON dt.approved_by = approver.id
      WHERE dt.project_id = ?
      ORDER BY dt.deadline ASC, dt.priority DESC`,
      [projectId]
    );

    return rows;
  }

  // Get tasks by department
  static async getByDepartment(departmentId, status = null) {
    let query = `
      SELECT 
        dt.*,
        p.name as project_name,
        p.status as project_status,
        assigner.username as assigned_by_name,
        (SELECT COUNT(*) FROM project_member_tasks 
         WHERE department_task_id = dt.id) as member_tasks_count,
        (SELECT COUNT(*) FROM project_member_tasks 
         WHERE department_task_id = dt.id AND status = 'completed') as completed_member_tasks
      FROM project_department_tasks dt
      INNER JOIN projects p ON dt.project_id = p.id
      INNER JOIN users assigner ON dt.assigned_by = assigner.id
      WHERE dt.department_id = ?
    `;

    const params = [departmentId];

    if (status) {
      query += ` AND dt.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY dt.deadline ASC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get task by ID
  static async getById(taskId) {
    const [rows] = await db.query(
      `SELECT 
        dt.*,
        d.name as department_name,
        p.name as project_name,
        assigner.username as assigned_by_name,
        accepter.username as accepted_by_name
      FROM project_department_tasks dt
      INNER JOIN departments d ON dt.department_id = d.id
      INNER JOIN projects p ON dt.project_id = p.id
      INNER JOIN users assigner ON dt.assigned_by = assigner.id
      LEFT JOIN users accepter ON dt.accepted_by = accepter.id
      WHERE dt.id = ?`,
      [taskId]
    );

    return rows[0];
  }

  // Manager: Accept task
  static async accept(taskId, managerId) {
    const [result] = await db.query(
      `UPDATE project_department_tasks 
       SET status = 'in_progress', 
           accepted_at = NOW(), 
           accepted_by = ?,
           updated_at = NOW()
       WHERE id = ? AND status = 'assigned'`,
      [managerId, taskId]
    );

    return result;
  }

  // Manager: Reject task
  static async reject(taskId, managerId, reason) {
    const [result] = await db.query(
      `UPDATE project_department_tasks 
       SET status = 'rejected', 
           accepted_by = ?,
           rejection_reason = ?,
           updated_at = NOW()
       WHERE id = ? AND status = 'assigned'`,
      [managerId, reason, taskId]
    );

    return result;
  }

  // Manager: Update progress
  static async updateProgress(taskId, progress, actualHours = null) {
    let query = `UPDATE project_department_tasks SET progress = ?, updated_at = NOW()`;
    const params = [progress];

    if (actualHours !== null) {
      query += `, actual_hours = ?`;
      params.push(actualHours);
    }

    // Note: Don't auto-complete. Manager must explicitly submit for approval.
    // Keep status as 'in_progress' even at 100%
    // if (progress >= 100) {
    //   query += `, status = 'completed', completed_at = NOW()`;
    // } else if (progress > 0) {
    //   query += `, status = 'in_progress'`;
    // }

    query += ` WHERE id = ?`;
    params.push(taskId);

    const [result] = await db.query(query, params);
    return result;
  }

  // Manager: Submit for approval
  static async submit(taskId, managerId, notes) {
    const [result] = await db.query(
      `UPDATE project_department_tasks 
       SET status = 'submitted', 
           submitted_at = NOW(),
           submitted_by = ?,
           submission_notes = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [managerId, notes, taskId]
    );

    return result;
  }

  // Admin: Approve task
  static async approve(taskId, adminId, notes = null) {
    const [result] = await db.query(
      `UPDATE project_department_tasks 
       SET status = 'approved', 
           approved_at = NOW(),
           approved_by = ?,
           approval_notes = ?,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = ? AND status = 'submitted'`,
      [adminId, notes, taskId]
    );

    return result;
  }

  // Admin: Reject submitted task
  static async rejectSubmission(taskId, adminId, notes) {
    const [result] = await db.query(
      `UPDATE project_department_tasks 
       SET status = 'in_progress', 
           approved_by = ?,
           approval_notes = ?,
           submitted_at = NULL,
           submitted_by = NULL,
           updated_at = NOW()
       WHERE id = ? AND status = 'submitted'`,
      [adminId, notes, taskId]
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
      `UPDATE project_department_tasks SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result;
  }

  // Delete task
  static async delete(taskId) {
    const [result] = await db.query(
      `DELETE FROM project_department_tasks WHERE id = ?`,
      [taskId]
    );

    return result;
  }

  // Get overdue tasks
  static async getOverdue(departmentId = null) {
    let query = `
      SELECT 
        dt.*,
        d.name as department_name,
        p.name as project_name
      FROM project_department_tasks dt
      INNER JOIN departments d ON dt.department_id = d.id
      INNER JOIN projects p ON dt.project_id = p.id
      WHERE dt.deadline < CURDATE() 
      AND dt.status NOT IN ('completed', 'approved')
    `;

    const params = [];

    if (departmentId) {
      query += ` AND dt.department_id = ?`;
      params.push(departmentId);
    }

    query += ` ORDER BY dt.deadline ASC`;

    const [rows] = await db.query(query, params);
    return rows;
  }
}

module.exports = DepartmentTask;

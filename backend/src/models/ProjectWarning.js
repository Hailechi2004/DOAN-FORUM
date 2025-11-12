const db = require("../config/database");

class ProjectWarning {
  // Create warning
  static async create(warningData) {
    const {
      project_id,
      department_task_id = null,
      member_task_id = null,
      warned_user_id,
      issued_by,
      warning_type,
      severity,
      reason,
      penalty_amount = null,
    } = warningData;

    const [result] = await db.query(
      `INSERT INTO project_warnings 
       (project_id, department_task_id, member_task_id, warned_user_id, 
        issued_by, warning_type, severity, reason, penalty_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        department_task_id,
        member_task_id,
        warned_user_id,
        issued_by,
        warning_type,
        severity,
        reason,
        penalty_amount,
      ]
    );

    return result.insertId;
  }

  // Get warnings by project
  static async getByProject(projectId, severity = null) {
    let query = `
      SELECT 
        w.*,
        warned.username as warned_username,
        warned.email as warned_email,
        issuer.username as issued_by_name,
        ack.username as acknowledged_by_name,
        dt.title as department_task_title,
        mt.title as member_task_title
      FROM project_warnings w
      INNER JOIN users warned ON w.warned_user_id = warned.id
      INNER JOIN users issuer ON w.issued_by = issuer.id
      LEFT JOIN users ack ON w.acknowledged_by = ack.id
      LEFT JOIN project_department_tasks dt ON w.department_task_id = dt.id
      LEFT JOIN project_member_tasks mt ON w.member_task_id = mt.id
      WHERE w.project_id = ?
    `;

    const params = [projectId];

    if (severity) {
      query += ` AND w.severity = ?`;
      params.push(severity);
    }

    query += ` ORDER BY w.issued_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get warnings by user
  static async getByUser(userId, acknowledged = null) {
    let query = `
      SELECT 
        w.*,
        issuer.username as issued_by_name,
        p.name as project_name,
        dt.title as department_task_title,
        mt.title as member_task_title
      FROM project_warnings w
      INNER JOIN users issuer ON w.issued_by = issuer.id
      INNER JOIN projects p ON w.project_id = p.id
      LEFT JOIN project_department_tasks dt ON w.department_task_id = dt.id
      LEFT JOIN project_member_tasks mt ON w.member_task_id = mt.id
      WHERE w.warned_user_id = ?
    `;

    const params = [userId];

    if (acknowledged !== null) {
      if (acknowledged) {
        query += ` AND w.acknowledged_at IS NOT NULL`;
      } else {
        query += ` AND w.acknowledged_at IS NULL`;
      }
    }

    query += ` ORDER BY w.issued_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get warning by ID
  static async getById(warningId) {
    const [rows] = await db.query(
      `SELECT 
        w.*,
        warned.username as warned_username,
        warned.email as warned_email,
        issuer.username as issued_by_name,
        ack.username as acknowledged_by_name,
        p.name as project_name,
        dt.title as department_task_title,
        mt.title as member_task_title
      FROM project_warnings w
      INNER JOIN users warned ON w.warned_user_id = warned.id
      INNER JOIN users issuer ON w.issued_by = issuer.id
      LEFT JOIN users ack ON w.acknowledged_by = ack.id
      INNER JOIN projects p ON w.project_id = p.id
      LEFT JOIN project_department_tasks dt ON w.department_task_id = dt.id
      LEFT JOIN project_member_tasks mt ON w.member_task_id = mt.id
      WHERE w.id = ?`,
      [warningId]
    );

    return rows[0];
  }

  // User acknowledges warning
  static async acknowledge(warningId, userId) {
    const [result] = await db.query(
      `UPDATE project_warnings 
       SET acknowledged_at = NOW(),
           acknowledged_by = ?
       WHERE id = ? AND warned_user_id = ? AND acknowledged_at IS NULL`,
      [userId, warningId, userId]
    );

    return result;
  }

  // Get user warning statistics
  static async getUserStats(userId, projectId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_warnings,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_severity,
        SUM(CASE WHEN warning_type = 'late_submission' THEN 1 ELSE 0 END) as late_submissions,
        SUM(CASE WHEN warning_type = 'poor_quality' THEN 1 ELSE 0 END) as poor_quality,
        SUM(CASE WHEN warning_type = 'missed_deadline' THEN 1 ELSE 0 END) as missed_deadlines,
        SUM(CASE WHEN warning_type = 'incomplete_work' THEN 1 ELSE 0 END) as incomplete_work,
        SUM(penalty_amount) as total_penalties,
        SUM(CASE WHEN acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged_warnings
      FROM project_warnings
      WHERE warned_user_id = ?
    `;

    const params = [userId];

    if (projectId) {
      query += ` AND project_id = ?`;
      params.push(projectId);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
  }

  // Get unacknowledged warnings
  static async getUnacknowledged(userId = null) {
    let query = `
      SELECT 
        w.*,
        warned.username as warned_username,
        issuer.username as issued_by_name,
        p.name as project_name
      FROM project_warnings w
      INNER JOIN users warned ON w.warned_user_id = warned.id
      INNER JOIN users issuer ON w.issued_by = issuer.id
      INNER JOIN projects p ON w.project_id = p.id
      WHERE w.acknowledged_at IS NULL
    `;

    const params = [];

    if (userId) {
      query += ` AND w.warned_user_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY w.issued_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Delete warning
  static async delete(warningId) {
    const [result] = await db.query(
      `DELETE FROM project_warnings WHERE id = ?`,
      [warningId]
    );

    return result;
  }

  // Get warnings by task
  static async getByTask(departmentTaskId = null, memberTaskId = null) {
    let query = `
      SELECT 
        w.*,
        warned.username as warned_username,
        issuer.username as issued_by_name
      FROM project_warnings w
      INNER JOIN users warned ON w.warned_user_id = warned.id
      INNER JOIN users issuer ON w.issued_by = issuer.id
      WHERE 1=1
    `;

    const params = [];

    if (departmentTaskId) {
      query += ` AND w.department_task_id = ?`;
      params.push(departmentTaskId);
    }

    if (memberTaskId) {
      query += ` AND w.member_task_id = ?`;
      params.push(memberTaskId);
    }

    query += ` ORDER BY w.issued_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get project warning summary
  static async getProjectSummary(projectId) {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total_warnings,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_warnings,
        SUM(penalty_amount) as total_penalties,
        COUNT(DISTINCT warned_user_id) as warned_users_count
      FROM project_warnings
      WHERE project_id = ?`,
      [projectId]
    );

    return rows[0];
  }
}

module.exports = ProjectWarning;

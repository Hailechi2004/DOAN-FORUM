const db = require("../config/database");

class TaskReport {
  // Create report
  static async create(reportData) {
    const {
      project_id,
      department_task_id = null,
      member_task_id = null,
      reported_by,
      report_type,
      title,
      content,
      progress,
      issues = null,
      attachments = null,
    } = reportData;

    const [result] = await db.query(
      `INSERT INTO project_task_reports 
       (project_id, department_task_id, member_task_id, reported_by, report_type, 
        title, content, progress, issues, attachments) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        department_task_id,
        member_task_id,
        reported_by,
        report_type,
        title,
        content,
        progress,
        issues,
        attachments,
      ]
    );

    return result.insertId;
  }

  // Get reports by project
  static async getByProject(projectId, reportType = null) {
    let query = `
      SELECT 
        r.*,
        u.username as reported_by_name,
        u.email as reported_by_email,
        dt.title as department_task_title,
        mt.title as member_task_title,
        d.name as department_name
      FROM project_task_reports r
      INNER JOIN users u ON r.reported_by = u.id
      LEFT JOIN project_department_tasks dt ON r.department_task_id = dt.id
      LEFT JOIN project_member_tasks mt ON r.member_task_id = mt.id
      LEFT JOIN departments d ON dt.department_id = d.id
      WHERE r.project_id = ?
    `;

    const params = [projectId];

    if (reportType) {
      query += ` AND r.report_type = ?`;
      params.push(reportType);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get reports by department task
  static async getByDepartmentTask(departmentTaskId) {
    const [rows] = await db.query(
      `SELECT 
        r.*,
        u.username as reported_by_name,
        u.email as reported_by_email
      FROM project_task_reports r
      INNER JOIN users u ON r.reported_by = u.id
      WHERE r.department_task_id = ?
      ORDER BY r.created_at DESC`,
      [departmentTaskId]
    );

    return rows;
  }

  // Get reports by member task
  static async getByMemberTask(memberTaskId) {
    const [rows] = await db.query(
      `SELECT 
        r.*,
        u.username as reported_by_name,
        u.email as reported_by_email
      FROM project_task_reports r
      INNER JOIN users u ON r.reported_by = u.id
      WHERE r.member_task_id = ?
      ORDER BY r.created_at DESC`,
      [memberTaskId]
    );

    return rows;
  }

  // Get reports by user
  static async getByUser(userId, reportType = null) {
    let query = `
      SELECT 
        r.*,
        p.name as project_name,
        dt.title as department_task_title,
        mt.title as member_task_title
      FROM project_task_reports r
      INNER JOIN projects p ON r.project_id = p.id
      LEFT JOIN project_department_tasks dt ON r.department_task_id = dt.id
      LEFT JOIN project_member_tasks mt ON r.member_task_id = mt.id
      WHERE r.reported_by = ?
    `;

    const params = [userId];

    if (reportType) {
      query += ` AND r.report_type = ?`;
      params.push(reportType);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get report by ID
  static async getById(reportId) {
    const [rows] = await db.query(
      `SELECT 
        r.*,
        u.username as reported_by_name,
        u.email as reported_by_email,
        p.name as project_name,
        dt.title as department_task_title,
        mt.title as member_task_title,
        d.name as department_name
      FROM project_task_reports r
      INNER JOIN users u ON r.reported_by = u.id
      INNER JOIN projects p ON r.project_id = p.id
      LEFT JOIN project_department_tasks dt ON r.department_task_id = dt.id
      LEFT JOIN project_member_tasks mt ON r.member_task_id = mt.id
      LEFT JOIN departments d ON dt.department_id = d.id
      WHERE r.id = ?`,
      [reportId]
    );

    return rows[0];
  }

  // Update report
  static async update(reportId, updates) {
    const allowedFields = [
      "title",
      "content",
      "progress",
      "issues",
      "attachments",
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
    values.push(reportId);

    const [result] = await db.query(
      `UPDATE project_task_reports SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result;
  }

  // Delete report
  static async delete(reportId) {
    const [result] = await db.query(
      `DELETE FROM project_task_reports WHERE id = ?`,
      [reportId]
    );

    return result;
  }

  // Get latest reports summary (dashboard)
  static async getLatestReports(limit = 10) {
    const [rows] = await db.query(
      `SELECT 
        r.*,
        u.username as reported_by_name,
        p.name as project_name,
        dt.title as department_task_title
      FROM project_task_reports r
      INNER JOIN users u ON r.reported_by = u.id
      INNER JOIN projects p ON r.project_id = p.id
      LEFT JOIN project_department_tasks dt ON r.department_task_id = dt.id
      ORDER BY r.created_at DESC
      LIMIT ?`,
      [limit]
    );

    return rows;
  }

  // Get reports statistics by project
  static async getStatsByProject(projectId) {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN report_type = 'daily' THEN 1 ELSE 0 END) as daily_reports,
        SUM(CASE WHEN report_type = 'weekly' THEN 1 ELSE 0 END) as weekly_reports,
        SUM(CASE WHEN report_type = 'monthly' THEN 1 ELSE 0 END) as monthly_reports,
        SUM(CASE WHEN report_type = 'completion' THEN 1 ELSE 0 END) as completion_reports,
        AVG(progress) as average_progress
      FROM project_task_reports
      WHERE project_id = ?`,
      [projectId]
    );

    return rows[0];
  }

  // Get reports with issues
  static async getReportsWithIssues(projectId = null) {
    let query = `
      SELECT 
        r.*,
        u.username as reported_by_name,
        p.name as project_name,
        dt.title as department_task_title
      FROM project_task_reports r
      INNER JOIN users u ON r.reported_by = u.id
      INNER JOIN projects p ON r.project_id = p.id
      LEFT JOIN project_department_tasks dt ON r.department_task_id = dt.id
      WHERE r.issues IS NOT NULL AND r.issues != ''
    `;

    const params = [];

    if (projectId) {
      query += ` AND r.project_id = ?`;
      params.push(projectId);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }
}

module.exports = TaskReport;

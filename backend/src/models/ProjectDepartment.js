const db = require("../config/database");

class ProjectDepartment {
  // Admin assigns departments to project
  static async assignDepartments(projectId, departmentIds, createdBy) {
    const values = departmentIds.map((deptId) => [
      projectId,
      deptId,
      "pending",
      new Date(), // assigned_at
    ]);

    const [result] = await db.query(
      `INSERT INTO project_departments (project_id, department_id, status, assigned_at) 
       VALUES ? 
       ON DUPLICATE KEY UPDATE status = 'pending', assigned_at = VALUES(assigned_at)`,
      [values]
    );

    return result;
  }

  // Get all departments assigned to a project
  static async getProjectDepartments(projectId) {
    const [rows] = await db.query(
      `SELECT 
        pd.*,
        d.name as department_name,
        d.code as department_code,
        d.manager_id,
        u.username as manager_name,
        u.email as manager_email,
        t.name as assigned_team_name,
        (SELECT COUNT(*) FROM project_team_members 
         WHERE project_id = pd.project_id 
         AND department_id = pd.department_id) as member_count
      FROM project_departments pd
      LEFT JOIN departments d ON pd.department_id = d.id
      LEFT JOIN users u ON d.manager_id = u.id
      LEFT JOIN teams t ON pd.assigned_team_id = t.id
      WHERE pd.project_id = ?
      ORDER BY pd.created_at DESC`,
      [projectId]
    );

    return rows;
  }

  // Get projects assigned to a department (for manager view)
  static async getDepartmentProjects(departmentId, status = null) {
    let query = `
      SELECT 
        pd.*,
        p.name as project_name,
        p.description as project_description,
        p.status as project_status,
        p.priority,
        p.start_date,
        p.end_date,
        p.created_at as project_created_at,
        (SELECT COUNT(*) FROM project_team_members 
         WHERE project_id = pd.project_id 
         AND department_id = pd.department_id) as member_count
      FROM project_departments pd
      INNER JOIN projects p ON pd.project_id = p.id
      WHERE pd.department_id = ?
    `;

    const params = [departmentId];

    if (status) {
      query += ` AND pd.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY pd.created_at DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Manager assigns team to project
  static async assignTeam(projectId, departmentId, teamId, assignedBy) {
    const [result] = await db.query(
      `UPDATE project_departments 
       SET assigned_team_id = ?, 
           assigned_by = ?, 
           assigned_at = NOW(),
           status = 'accepted',
           updated_at = NOW()
       WHERE project_id = ? AND department_id = ?`,
      [teamId, assignedBy, projectId, departmentId]
    );

    return result;
  }

  // Update department assignment status
  static async updateStatus(projectId, departmentId, status) {
    const [result] = await db.query(
      `UPDATE project_departments 
       SET status = ?, updated_at = NOW()
       WHERE project_id = ? AND department_id = ?`,
      [status, projectId, departmentId]
    );

    return result;
  }

  // Remove department from project
  static async removeDepartment(projectId, departmentId) {
    const [result] = await db.query(
      `DELETE FROM project_departments 
       WHERE project_id = ? AND department_id = ?`,
      [projectId, departmentId]
    );

    return result;
  }

  // Check if department is assigned to project
  static async isAssigned(projectId, departmentId) {
    const [rows] = await db.query(
      `SELECT id FROM project_departments 
       WHERE project_id = ? AND department_id = ?`,
      [projectId, departmentId]
    );

    return rows.length > 0;
  }

  // Department Manager accepts project invitation
  static async acceptInvitation(projectId, departmentId, confirmedBy) {
    const [result] = await db.query(
      `UPDATE project_departments 
       SET status = 'accepted', 
           confirmed_by = ?,
           confirmed_at = NOW(),
           updated_at = NOW()
       WHERE project_id = ? AND department_id = ? AND status = 'pending'`,
      [confirmedBy, projectId, departmentId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Invitation not found or already processed");
    }

    return result;
  }

  // Department Manager rejects project invitation
  static async rejectInvitation(
    projectId,
    departmentId,
    rejectedBy,
    reason = null
  ) {
    const [result] = await db.query(
      `UPDATE project_departments 
       SET status = 'rejected', 
           rejected_by = ?,
           rejected_at = NOW(),
           rejection_reason = ?,
           updated_at = NOW()
       WHERE project_id = ? AND department_id = ? AND status = 'pending'`,
      [rejectedBy, reason, projectId, departmentId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Invitation not found or already processed");
    }

    return result;
  }
}

module.exports = ProjectDepartment;

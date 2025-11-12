const db = require("../config/database");

class ProjectTeamMember {
  // Assign members to project (by department manager)
  static async assignMembers(
    projectId,
    departmentId,
    teamId,
    memberIds,
    assignedBy
  ) {
    const values = memberIds.map((userId) => [
      projectId,
      departmentId,
      teamId,
      userId,
      "member",
      assignedBy,
    ]);

    const [result] = await db.query(
      `INSERT INTO project_team_members 
       (project_id, department_id, team_id, user_id, role, assigned_by) 
       VALUES ?
       ON DUPLICATE KEY UPDATE 
         team_id = VALUES(team_id),
         role = VALUES(role),
         assigned_by = VALUES(assigned_by),
         assigned_at = NOW()`,
      [values]
    );

    return result;
  }

  // Get all members of a project
  static async getProjectMembers(projectId) {
    const [rows] = await db.query(
      `SELECT 
        ptm.*,
        u.username,
        u.email,
        p.full_name,
        p.phone,
        p.avatar_url,
        d.name as department_name,
        t.name as team_name,
        assigner.username as assigned_by_name
      FROM project_team_members ptm
      INNER JOIN users u ON ptm.user_id = u.id
      LEFT JOIN profiles p ON u.profile_id = p.id
      LEFT JOIN departments d ON ptm.department_id = d.id
      LEFT JOIN teams t ON ptm.team_id = t.id
      LEFT JOIN users assigner ON ptm.assigned_by = assigner.id
      WHERE ptm.project_id = ?
      ORDER BY d.name, t.name, p.full_name`,
      [projectId]
    );

    return rows;
  }

  // Get members by department
  static async getProjectMembersByDepartment(projectId, departmentId) {
    const [rows] = await db.query(
      `SELECT 
        ptm.*,
        u.username,
        u.email,
        p.full_name,
        p.phone,
        p.avatar_url,
        t.name as team_name
      FROM project_team_members ptm
      INNER JOIN users u ON ptm.user_id = u.id
      LEFT JOIN profiles p ON u.profile_id = p.id
      LEFT JOIN teams t ON ptm.team_id = t.id
      WHERE ptm.project_id = ? AND ptm.department_id = ?
      ORDER BY t.name, p.full_name`,
      [projectId, departmentId]
    );

    return rows;
  }

  // Remove member from project
  static async removeMember(projectId, userId) {
    const [result] = await db.query(
      `DELETE FROM project_team_members 
       WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );

    return result;
  }

  // Update member role
  static async updateMemberRole(projectId, userId, role) {
    const [result] = await db.query(
      `UPDATE project_team_members 
       SET role = ?, assigned_at = NOW()
       WHERE project_id = ? AND user_id = ?`,
      [role, projectId, userId]
    );

    return result;
  }

  // Check if user is member of project
  static async isMember(projectId, userId) {
    const [rows] = await db.query(
      `SELECT id FROM project_team_members 
       WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );

    return rows.length > 0;
  }

  // Get member count by department
  static async getMemberCountByDepartment(projectId) {
    const [rows] = await db.query(
      `SELECT 
        d.id as department_id,
        d.name as department_name,
        COUNT(ptm.id) as member_count
      FROM departments d
      LEFT JOIN project_team_members ptm ON d.id = ptm.department_id AND ptm.project_id = ?
      GROUP BY d.id, d.name
      HAVING member_count > 0
      ORDER BY d.name`,
      [projectId]
    );

    return rows;
  }
}

module.exports = ProjectTeamMember;

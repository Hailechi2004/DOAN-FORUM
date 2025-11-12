const db = require("../config/database");

class Team {
  // Create team
  static async create(data) {
    const { name, description, department_id } = data;

    const [result] = await db.query(
      `INSERT INTO teams (name, description, department_id, created_at)
       VALUES (?, ?, ?, NOW())`,
      [name, description, department_id || null]
    );

    return this.findById(result.insertId);
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        t.*,
        d.name as department_name,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
       FROM teams t
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.id = ?`,
      [id]
    );

    return rows[0];
  }

  // Get all teams
  static async getAll(filters = {}) {
    const { department_id, search, page = 1, limit = 20 } = filters;

    let query = `
      SELECT 
        t.*,
        d.name as department_name,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
      FROM teams t
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE 1=1
    `;

    const params = [];

    if (department_id) {
      query += ` AND t.department_id = ?`;
      params.push(department_id);
    }

    if (search) {
      query += ` AND (t.name LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = query.replace(
      /SELECT.*FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    return {
      teams: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get team members
  static async getMembers(teamId) {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.email,
        u.username,
        p.full_name,
        up.avatar_url,
        up.phone,
        er.position,
        tm.role,
        tm.joined_at
       FROM team_members tm
       INNER JOIN users u ON tm.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE tm.team_id = ? AND u.deleted_at IS NULL
       ORDER BY tm.role, p.full_name`,
      [teamId]
    );

    return rows;
  }

  // Add member to team
  static async addMember(teamId, userId, role = "member") {
    // Check if already a member
    const [existing] = await db.query(
      `SELECT id FROM team_members WHERE team_id = ? AND user_id = ?`,
      [teamId, userId]
    );

    if (existing.length > 0) {
      throw new Error("User is already a member of this team");
    }

    await db.query(
      `INSERT INTO team_members (team_id, user_id, role, joined_at)
       VALUES (?, ?, ?, NOW())`,
      [teamId, userId, role]
    );

    return true;
  }

  // Remove member from team
  static async removeMember(teamId, userId) {
    const [result] = await db.query(
      `DELETE FROM team_members WHERE team_id = ? AND user_id = ?`,
      [teamId, userId]
    );

    return result.affectedRows > 0;
  }

  // Update member role
  static async updateMemberRole(teamId, userId, role) {
    await db.query(
      `UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?`,
      [role, teamId, userId]
    );

    return true;
  }

  // Update team
  static async update(id, data) {
    const { name, description, department_id } = data;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (department_id !== undefined) {
      updates.push("department_id = ?");
      params.push(department_id);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE teams SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  // Soft delete
  static async delete(id) {
    await db.query(`UPDATE teams SET deleted_at = NOW() WHERE id = ?`, [id]);
    return true;
  }

  // Get team statistics
  static async getStats(id) {
    const [stats] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM team_members WHERE team_id = ?) as total_members,
        (SELECT COUNT(*) FROM tasks WHERE 1=0) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE 1=0) as completed_tasks,
        (SELECT COUNT(*) FROM projects WHERE 1=0) as total_projects
      `,
      [id]
    );

    return stats[0];
  }
}

module.exports = Team;

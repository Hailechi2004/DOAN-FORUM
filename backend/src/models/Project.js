const db = require("../config/database");

class Project {
  static async create(data) {
    const {
      name,
      description,
      department_id,
      manager_id,
      start_date,
      end_date,
      status,
    } = data;

    const [result] = await db.query(
      `INSERT INTO projects (name, description, department_id, manager_id, start_date, end_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        description,
        department_id || null,
        manager_id || null,
        start_date || null,
        end_date || null,
        status || "planning",
      ]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        p.*,
        prof.full_name as manager_name,
        d.name as department_name,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND is_deleted = FALSE) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed' AND is_deleted = FALSE) as completed_tasks
       FROM projects p
       LEFT JOIN users u ON p.manager_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN departments d ON p.department_id = d.id
       WHERE p.id = ? AND p.is_deleted = FALSE`,
      [id]
    );

    return rows[0];
  }

  static async getAll(filters = {}) {
    const { department_id, status, search, page = 1, limit = 20 } = filters;

    let query = `
      SELECT 
        p.*,
        prof.full_name as manager_name,
        d.name as department_name,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND is_deleted = FALSE) as task_count
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      LEFT JOIN departments d ON p.department_id = d.id
      WHERE p.is_deleted = FALSE
    `;

    const params = [];

    if (department_id) {
      // Check both direct department_id AND project_departments junction table using EXISTS subquery
      query += ` AND (p.department_id = ? OR EXISTS (
        SELECT 1 FROM project_departments pd 
        WHERE pd.project_id = p.id AND pd.department_id = ?
      ))`;
      params.push(department_id, department_id);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = query.replace(
      /SELECT[\s\S]+FROM projects/,
      "SELECT COUNT(p.id) as total FROM projects"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    return {
      projects: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getMembers(projectId) {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.email,
        u.username,
        up.full_name,
        up.avatar_url,
        pm.role,
        pm.joined_at
       FROM project_members pm
       INNER JOIN users u ON pm.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE pm.project_id = ?
       ORDER BY pm.role, up.full_name`,
      [projectId]
    );

    return rows;
  }

  static async addMember(projectId, userId, role = "member") {
    const [existing] = await db.query(
      `SELECT id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );

    if (existing.length > 0) {
      throw new Error("User is already a member");
    }

    await db.query(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, NOW())`,
      [projectId, userId, role]
    );

    return true;
  }

  static async removeMember(projectId, userId) {
    const [result] = await db.query(
      `DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );

    return result.affectedRows > 0;
  }

  static async update(id, data) {
    const {
      name,
      description,
      department_id,
      manager_id,
      start_date,
      end_date,
      status,
      progress,
    } = data;

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
    if (manager_id !== undefined) {
      updates.push("manager_id = ?");
      params.push(manager_id);
    }
    if (start_date !== undefined) {
      updates.push("start_date = ?");
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push("end_date = ?");
      params.push(end_date);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (progress !== undefined) {
      updates.push("progress = ?");
      params.push(progress);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE projects SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.query(`UPDATE projects SET deleted_at = NOW() WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = Project;

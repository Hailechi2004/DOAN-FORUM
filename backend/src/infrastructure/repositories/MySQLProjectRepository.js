const IProjectRepository = require("../../domain/repositories/IProjectRepository");
const db = require("../../config/database");

class MySQLProjectRepository extends IProjectRepository {
  async create(data) {
    const {
      name,
      description,
      department_id,
      team_id,
      manager_id,
      start_date,
      end_date,
      status,
      priority,
      budget,
    } = data;

    const [result] = await db.query(
      `INSERT INTO projects (name, description, department_id, team_id, manager_id, start_date, end_date, status, priority, budget, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        description,
        department_id || null,
        team_id || null,
        manager_id || null,
        start_date || null,
        end_date || null,
        status || "planning",
        priority || "medium",
        budget || null,
      ]
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
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

  async getAll(filters = {}) {
    const {
      department_id,
      member_id,
      status,
      search,
      page = 1,
      limit = 20,
    } = filters;

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
    if (member_id) {
      // Check if user is a member of the project
      query += ` AND EXISTS (
        SELECT 1 FROM project_members pm 
        WHERE pm.project_id = p.id AND pm.user_id = ?
      )`;
      params.push(member_id);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace(
      /SELECT[\s\S]+FROM projects/,
      "SELECT COUNT(p.id) as total FROM projects"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));

    const [projects] = await db.query(query, params);

    return {
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }
    if (data.start_date !== undefined) {
      fields.push("start_date = ?");
      values.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      fields.push("end_date = ?");
      values.push(data.end_date);
    }
    if (data.manager_id !== undefined) {
      fields.push("manager_id = ?");
      values.push(data.manager_id);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.query(
        `UPDATE projects SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }
  }

  async delete(id) {
    await db.query(`UPDATE projects SET is_deleted = TRUE WHERE id = ?`, [id]);
  }

  async addMember(projectId, userId, role = "member") {
    await db.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role = ?`,
      [projectId, userId, role, role]
    );
  }

  async removeMember(projectId, userId) {
    await db.query(
      `DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );
  }

  async getMembers(projectId) {
    const [rows] = await db.query(
      `SELECT pm.*, u.username, u.email, p.full_name, p.avatar_url
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE pm.project_id = ?`,
      [projectId]
    );
    return rows;
  }

  async updateStatus(projectId, status) {
    await db.query(
      `UPDATE projects SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, projectId]
    );
  }
}

module.exports = MySQLProjectRepository;

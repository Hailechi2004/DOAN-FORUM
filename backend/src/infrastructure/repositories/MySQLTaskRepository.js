const ITaskRepository = require("../../domain/repositories/ITaskRepository");
const db = require("../../config/database");

class MySQLTaskRepository extends ITaskRepository {
  async create(data) {
    const {
      title,
      description,
      project_id,
      assigned_to,
      created_by,
      priority,
      status,
      due_date,
    } = data;

    const [result] = await db.query(
      `INSERT INTO tasks (title, description, project_id, assigned_to, created_by, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        project_id || null,
        assigned_to || null,
        created_by,
        priority || "medium",
        status || "pending",
        due_date || null,
      ]
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        t.*,
        pa.full_name as assigned_to_name,
        pc.full_name as created_by_name,
        p.name as project_name
       FROM tasks t
       LEFT JOIN users ua ON t.assigned_to = ua.id
       LEFT JOIN profiles pa ON ua.id = pa.user_id
       LEFT JOIN users uc ON t.created_by = uc.id
       LEFT JOIN profiles pc ON uc.id = pc.user_id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = ? AND t.is_deleted = FALSE`,
      [id]
    );

    return rows[0];
  }

  async getAll(filters = {}) {
    const {
      project_id,
      assigned_to,
      created_by,
      status,
      priority,
      search,
      page = 1,
      limit = 20,
    } = filters;

    let query = `
      SELECT 
        t.*,
        NULL as assigned_to_name,
        NULL as created_by_name,
        p.name as project_name
      FROM tasks t
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.is_deleted = FALSE
    `;

    const params = [];

    if (project_id) {
      query += ` AND t.project_id = ?`;
      params.push(project_id);
    }
    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }
    if (created_by) {
      query += ` AND t.created_by = ?`;
      params.push(created_by);
    }
    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }
    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));

    const [tasks] = await db.query(query, params);

    return {
      tasks,
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

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push("priority = ?");
      values.push(data.priority);
    }
    if (data.due_date !== undefined) {
      fields.push("due_date = ?");
      values.push(data.due_date);
    }
    if (data.assigned_to !== undefined) {
      fields.push("assigned_to = ?");
      values.push(data.assigned_to);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.query(
        `UPDATE tasks SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }
  }

  async delete(id) {
    await db.query(`UPDATE tasks SET is_deleted = TRUE WHERE id = ?`, [id]);
  }

  async updateStatus(taskId, status) {
    await db.query(
      `UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, taskId]
    );
  }

  async assignTo(taskId, userId) {
    await db.query(
      `UPDATE tasks SET assigned_to = ?, updated_at = NOW() WHERE id = ?`,
      [userId, taskId]
    );
  }

  async getComments(taskId) {
    // TODO: Implement when task_comments table exists
    return [];
  }
}

module.exports = MySQLTaskRepository;

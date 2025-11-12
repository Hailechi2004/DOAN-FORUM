const db = require("../config/database");

class Task {
  static async create(data) {
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

  static async findById(id) {
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

  static async getAll(filters = {}) {
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

    const offset = (page - 1) * limit;
    query += ` ORDER BY 
      CASE t.priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.due_date ASC,
      t.created_at DESC
      LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    return {
      items: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, data) {
    const {
      title,
      description,
      assigned_to,
      priority,
      status,
      due_date,
      completed_at,
    } = data;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (assigned_to !== undefined) {
      updates.push("assigned_to = ?");
      params.push(assigned_to);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      params.push(priority);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
      if (status === "completed" && !completed_at) {
        updates.push("completed_at = NOW()");
      }
    }
    if (due_date !== undefined) {
      updates.push("due_date = ?");
      params.push(due_date);
    }
    if (completed_at !== undefined) {
      updates.push("completed_at = ?");
      params.push(completed_at);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.query(`UPDATE tasks SET deleted_at = NOW() WHERE id = ?`, [id]);
    return true;
  }

  static async getComments(taskId) {
    // Task comments not implemented yet - returning empty array
    // TODO: Create task_comments table if this feature is needed
    return [];

    /* Original query when table exists:
    const [rows] = await db.query(
      `SELECT 
        tc.*,
        p.full_name as user_name,
        up.avatar_url
       FROM task_comments tc
       INNER JOIN users u ON tc.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE tc.task_id = ?
       ORDER BY tc.created_at DESC`,
      [taskId]
    );
    return rows;
    */
  }

  static async addComment(taskId, userId, content) {
    const [result] = await db.query(
      `INSERT INTO task_comments (task_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())`,
      [taskId, userId, content]
    );

    const [comment] = await db.query(
      `SELECT 
        tc.*,
        p.full_name as user_name,
        up.avatar_url
       FROM task_comments tc
       INNER JOIN users u ON tc.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE tc.id = ?`,
      [result.insertId]
    );

    return comment[0];
  }
}

module.exports = Task;

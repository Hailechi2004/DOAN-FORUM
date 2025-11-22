const db = require("../config/database");

class Department {
  // Create department
  static async create(data) {
    const { name, description, parent_id, manager_id } = data;

    const [result] = await db.query(
      `INSERT INTO departments (name, description, parent_id, manager_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [name, description, parent_id || null, manager_id || null]
    );

    return this.findById(result.insertId);
  }

  // Find by ID with manager info
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        d.*,
        p.full_name as manager_name,
        u.email as manager_email,
        (SELECT COUNT(*) FROM profiles WHERE 1=0) as member_count
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE d.id = ? `,
      [id]
    );

    return rows[0];
  }

  // Get all departments with hierarchy
  static async getAll(filters = {}) {
    const { parent_id, search } = filters;

    let query = `
      SELECT 
        d.*,
        p.full_name as manager_name,
        u.email as manager_email,
        (SELECT COUNT(*) FROM profiles WHERE 1=0) as member_count,
        pd.name as parent_name
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN departments pd ON d.parent_id = pd.id
      WHERE 1=1
    `;

    const params = [];

    if (parent_id !== undefined) {
      query += ` AND d.parent_id ${parent_id === null ? "IS NULL" : "= ?"}`;
      if (parent_id !== null) params.push(parent_id);
    }

    if (search) {
      query += ` AND (d.name LIKE ? OR d.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY d.name ASC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get department tree (hierarchical structure)
  static async getTree() {
    const [departments] = await db.query(
      `SELECT 
        d.*,
        p.full_name as manager_name,
        (SELECT COUNT(*) FROM profiles WHERE 1=0) as member_count
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE 1=1
       ORDER BY d.parent_id, d.name`
    );

    // Build tree structure
    const map = {};
    const tree = [];

    departments.forEach((dept) => {
      map[dept.id] = { ...dept, children: [] };
    });

    departments.forEach((dept) => {
      if (dept.parent_id) {
        if (map[dept.parent_id]) {
          map[dept.parent_id].children.push(map[dept.id]);
        }
      } else {
        tree.push(map[dept.id]);
      }
    });

    return tree;
  }

  // Get department members
  static async getMembers(departmentId) {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.email,
        u.username,
        p.full_name,
        p.avatar_url,
        p.phone,
        ur.role_id,
        r.name as role_name,
        u.status as is_active,
        u.created_at
       FROM user_roles ur
       INNER JOIN users u ON ur.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE ur.department_id = ? AND (u.is_deleted IS NULL OR u.is_deleted = 0)
       ORDER BY r.id, p.full_name`,
      [departmentId]
    );

    return rows;
  }

  // Find departments by manager ID
  static async findByManagerId(managerId) {
    const [rows] = await db.query(
      `SELECT 
        d.*,
        p.full_name as manager_name,
        u.email as manager_email
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE d.manager_id = ?`,
      [managerId]
    );

    return rows;
  }

  // Update department
  static async update(id, data) {
    const { name, description, parent_id, manager_id } = data;

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
    if (parent_id !== undefined) {
      updates.push("parent_id = ?");
      params.push(parent_id);
    }
    if (manager_id !== undefined) {
      updates.push("manager_id = ?");
      params.push(manager_id);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE departments SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  // Soft delete
  static async delete(id) {
    await db.query(`UPDATE departments SET deleted_at = NOW() WHERE id = ?`, [
      id,
    ]);
    return true;
  }

  // Check if department has children
  static async hasChildren(id) {
    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM departments WHERE parent_id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0].count > 0;
  }

  // Get department statistics
  static async getStats(id) {
    const [stats] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM profiles WHERE 1=0) as total_members,
        (SELECT COUNT(*) FROM posts WHERE 1=0) as total_posts,
        (SELECT COUNT(*) FROM projects WHERE 1=0) as total_projects,
        (SELECT COUNT(*) FROM departments WHERE parent_id = ?) as sub_departments
      `,
      [id, id, id, id]
    );

    return stats[0];
  }
}

module.exports = Department;

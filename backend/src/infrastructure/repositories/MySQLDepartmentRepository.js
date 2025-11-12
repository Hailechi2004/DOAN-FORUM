const IDepartmentRepository = require("../../domain/repositories/IDepartmentRepository");
const Department = require("../../domain/entities/Department");
const db = require("../../config/database");

class MySQLDepartmentRepository extends IDepartmentRepository {
  async create(data) {
    const { name, description, parent_id, manager_id } = data;

    const [result] = await db.query(
      `INSERT INTO departments (name, description, parent_id, manager_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [name, description, parent_id || null, manager_id || null]
    );

    return await this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        d.*,
        p.full_name as manager_name,
        u.email as manager_email
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE d.id = ?`,
      [id]
    );

    return rows[0] ? new Department(rows[0]) : null;
  }

  async getAll(filters = {}) {
    const { parent_id, search } = filters;

    let query = `
      SELECT 
        d.*,
        p.full_name as manager_name,
        u.email as manager_email,
        pd.name as parent_name
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN departments pd ON d.parent_id = pd.id
      WHERE d.is_active = TRUE
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
    return rows.map((row) => new Department(row));
  }

  async update(id, data) {
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

    if (updates.length === 0) return await this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE departments SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return await this.findById(id);
  }

  async delete(id) {
    await db.query(`UPDATE departments SET is_active = FALSE WHERE id = ?`, [
      id,
    ]);
    return true;
  }
}

module.exports = MySQLDepartmentRepository;

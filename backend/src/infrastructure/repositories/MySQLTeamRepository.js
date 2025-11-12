const ITeamRepository = require("../../domain/repositories/ITeamRepository");
const Team = require("../../domain/entities/Team");
const db = require("../../config/database");

class MySQLTeamRepository extends ITeamRepository {
  async create(data) {
    const { name, description, department_id } = data;

    const [result] = await db.query(
      `INSERT INTO teams (name, description, department_id, created_at)
       VALUES (?, ?, ?, NOW())`,
      [name, description, department_id || null]
    );

    return await this.findById(result.insertId);
  }

  async findById(id) {
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

    return rows[0] ? new Team(rows[0]) : null;
  }

  async getAll(filters = {}) {
    const { department_id, search, page = 1, limit = 20 } = filters;

    let query = `
      SELECT 
        t.*,
        d.name as department_name,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
      FROM teams t
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE t.is_active = TRUE
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
      teams: rows.map((row) => new Team(row)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id, data) {
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

    if (updates.length === 0) return await this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE teams SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return await this.findById(id);
  }

  async delete(id) {
    await db.query(`UPDATE teams SET is_active = FALSE WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = MySQLTeamRepository;

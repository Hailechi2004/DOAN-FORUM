const db = require("../config/database");

class Category {
  // Create category
  static async create(data) {
    const { code, name, description, icon, color } = data;

    // Generate code from name if not provided
    const categoryCode = code || name.toLowerCase().replace(/\s+/g, "_");

    const [result] = await db.query(
      `INSERT INTO post_categories (code, name, description, icon, color)
       VALUES (?, ?, ?, ?, ?)`,
      [categoryCode, name, description, icon || null, color || null]
    );

    return this.findById(result.insertId);
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        c.*,
        NULL as parent_name,
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id AND deleted_at IS NULL) as post_count
       FROM post_categories c
       
       WHERE c.id = ?`,
      [id]
    );

    return rows[0];
  }

  // Get all categories
  static async getAll(filters = {}) {
    const { parent_id, search } = filters;

    let query = `
      SELECT 
        c.*,
        NULL as parent_name,
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id AND deleted_at IS NULL) as post_count
      FROM post_categories c
      
      WHERE 1=1
    `;

    const params = [];

    if (parent_id !== undefined) {
      query += ` AND 1=1 -- c.parent_id ${parent_id === null ? "IS NULL" : "= ?"}`;
      if (parent_id !== null) params.push(parent_id);
    }

    if (search) {
      query += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.name ASC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Update category
  static async update(id, data) {
    const { code, name, description, icon, color } = data;

    const updates = [];
    const params = [];

    if (code !== undefined) {
      updates.push("code = ?");
      params.push(code);
    }
    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (icon !== undefined) {
      updates.push("icon = ?");
      params.push(icon);
    }
    if (color !== undefined) {
      updates.push("color = ?");
      params.push(color);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE post_categories SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  // Delete (hard delete since table has no deleted_at column)
  static async delete(id) {
    await db.query(`DELETE FROM post_categories WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = Category;

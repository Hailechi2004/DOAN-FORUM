const db = require("../config/database");

class Bookmark {
  static async create(userId, data) {
    const { post_id, notes } = data;

    // Check if already bookmarked
    const [existing] = await db.query(
      `SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?`,
      [userId, post_id]
    );

    if (existing.length > 0) {
      throw new Error("Already bookmarked");
    }

    const [result] = await db.query(
      `INSERT INTO bookmarks (user_id, post_id, created_at)
       VALUES (?, ?, NOW())`,
      [userId, post_id]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT b.*, 
              p.title as post_title,
              p.content as post_content,
              u.username as author_username,
              prof.full_name as author_name
       FROM bookmarks b
       LEFT JOIN posts p ON b.post_id = p.id
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       WHERE b.id = ?`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  static async getAll(userId, filters = {}) {
    const { search, page = 1, limit = 20 } = filters;

    let query = `
      SELECT b.*,
             p.title as post_title,
             p.content as post_content,
             u.username as author_username,
             prof.full_name as author_name
      FROM bookmarks b
      LEFT JOIN posts p ON b.post_id = p.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      WHERE b.user_id = ?
    `;

    const params = [userId];

    if (search) {
      query += ` AND (b.notes LIKE ? OR p.title LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace(
      /SELECT.*FROM/s,
      "SELECT COUNT(*) as total FROM"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    return {
      bookmarks: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, userId, data) {
    // notes removed

    await db.query(
      `UPDATE bookmarks SET  updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return this.findById(id);
  }

  static async delete(id, userId) {
    const [result] = await db.query(
      `DELETE FROM bookmarks WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return result.affectedRows > 0;
  }

  static async checkExists(userId, postId) {
    const [rows] = await db.query(
      `SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?`,
      [userId, postId]
    );

    return rows.length > 0;
  }
}

module.exports = Bookmark;

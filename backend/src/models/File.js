const db = require("../config/database");

class File {
  // Upload file
  static async create(data) {
    const {
      filename,
      original_name,
      file_path,
      file_size,
      mime_type,
      uploader_id,
      related_type,
      related_id,
    } = data;

    const [result] = await db.query(
      `INSERT INTO files (original_name, storage_path, mime_type, size_bytes, uploader_id, checksum, is_private)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        original_name,
        file_path,
        mime_type,
        file_size,
        uploader_id,
        filename, // use filename as checksum for now
        0, // not private by default
      ]
    );

    return this.findById(result.insertId);
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        f.*,
        p.full_name as uploader_name
       FROM files f
       LEFT JOIN users u ON f.uploader_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.id = ? AND 1=1`,
      [id]
    );

    return rows[0];
  }

  // Get all files
  static async getAll(filters = {}) {
    const {
      uploader_id,
      related_type,
      related_id,
      search,
      page = 1,
      limit = 20,
    } = filters;

    let query = `
      SELECT 
        f.*,
        p.full_name as uploader_name
      FROM files f
      LEFT JOIN users u ON f.uploader_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;

    const params = [];

    if (uploader_id) {
      query += ` AND f.uploader_id = ?`;
      params.push(uploader_id);
    }

    if (related_type) {
      query += ` AND f.related_type = ?`;
      params.push(related_type);
    }

    if (related_id) {
      query += ` AND f.related_id = ?`;
      params.push(related_id);
    }

    if (search) {
      query += ` AND (f.original_name LIKE ? OR f.filename LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
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

  // Soft delete
  static async delete(id) {
    await db.query(`UPDATE files SET deleted_at = NOW() WHERE id = ?`, [id]);
    return true;
  }

  // Get download count
  static async incrementDownload(id) {
    await db.query(
      `UPDATE files SET download_count = download_count + 1 WHERE id = ?`,
      [id]
    );
  }
}

module.exports = File;

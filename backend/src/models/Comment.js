const db = require("../config/database");

class CommentModel {
  async create(commentData) {
    const [result] = await db.execute(
      `INSERT INTO comments (post_id, author_id, parent_id, content, path)
       VALUES (?, ?, ?, ?, ?)`,
      [
        commentData.post_id,
        commentData.author_id,
        commentData.parent_id || null,
        commentData.content,
        commentData.path || "",
      ]
    );

    // Update path for nested comments
    if (commentData.parent_id) {
      const [parent] = await db.execute(
        "SELECT path FROM comments WHERE id = ?",
        [commentData.parent_id]
      );
      const newPath = parent[0].path
        ? `${parent[0].path}/${result.insertId}`
        : `${result.insertId}`;
      await db.execute("UPDATE comments SET path = ? WHERE id = ?", [
        newPath,
        result.insertId,
      ]);
    } else {
      await db.execute("UPDATE comments SET path = ? WHERE id = ?", [
        `${result.insertId}`,
        result.insertId,
      ]);
    }

    return result.insertId;
  }

  async findById(id, userId = null) {
    let query = `
      SELECT c.*, u.username as author_name, prof.full_name as author_full_name,
             prof.avatar_url as author_avatar,
             (SELECT COUNT(*) FROM reactions WHERE target_type = 'comment' AND target_id = c.id) as total_reactions
    `;

    if (userId) {
      query += `,
        (SELECT reaction_type FROM reactions WHERE target_type = 'comment' AND target_id = c.id AND user_id = ?) as user_reaction
      `;
    }

    query += `
      FROM comments c
      JOIN users u ON c.author_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      WHERE c.id = ? AND c.deleted_at IS NULL
    `;

    const params = userId ? [userId, id] : [id];
    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  async getByPostId(postId, userId = null) {
    let query = `
      SELECT c.*, u.username as author_name, prof.full_name as author_full_name,
             prof.avatar_url as author_avatar,
             (SELECT COUNT(*) FROM reactions WHERE target_type = 'comment' AND target_id = c.id) as total_reactions,
             (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND deleted_at IS NULL) as reply_count
    `;

    if (userId) {
      query += `,
        (SELECT reaction_type FROM reactions WHERE target_type = 'comment' AND target_id = c.id AND user_id = ?) as user_reaction
      `;
    }

    query += `
      FROM comments c
      JOIN users u ON c.author_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      WHERE c.post_id = ? AND c.deleted_at IS NULL
      ORDER BY c.path
    `;

    const params = userId ? [userId, postId] : [postId];
    const [rows] = await db.execute(query, params);
    return rows;
  }

  async update(id, content) {
    await db.execute(
      `UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?`,
      [content, id]
    );
  }

  async softDelete(id, deletedBy) {
    await db.execute(
      `UPDATE comments SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
      [deletedBy, id]
    );
  }
}

module.exports = new CommentModel();

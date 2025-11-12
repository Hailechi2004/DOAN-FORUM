const db = require("../config/database");

class PostModel {
  async create(postData) {
    const [result] = await db.execute(
      `INSERT INTO posts (author_id, title, content, visibility, category_id, 
                          department_id, team_id, allowed_group_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        postData.author_id,
        postData.title,
        postData.content,
        postData.visibility || "company",
        postData.category_id || null,
        postData.department_id || null,
        postData.team_id || null,
        postData.allowed_group_id || null,
      ]
    );
    return result.insertId;
  }

  async findById(id, userId = null) {
    let query = `
      SELECT p.*, u.username as author_name, up.full_name as author_full_name,
             up.avatar_url as author_avatar, pc.name as category_name,
             (SELECT COUNT(*) FROM reactions WHERE target_type = 'post' AND target_id = p.id) as total_reactions,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND deleted_at IS NULL) as total_comments,
             (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as total_shares,
             (SELECT COUNT(*) FROM post_views WHERE post_id = p.id) as total_views
    `;

    if (userId) {
      query += `,
        (SELECT reaction_type FROM reactions WHERE target_type = 'post' AND target_id = p.id AND user_id = ?) as user_reaction,
        (SELECT COUNT(*) FROM saved_posts WHERE post_id = p.id AND user_id = ?) as is_saved
      `;
    }

    query += `
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN profiles up ON u.id = up.user_id
      LEFT JOIN post_categories pc ON p.category_id = pc.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `;

    const params = userId ? [userId, userId, id] : [id];
    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  async getAll(filters = {}, userId = null) {
    const params = [];

    let query = `
      SELECT p.id, p.title, p.content, p.visibility, p.pinned, p.created_at, p.updated_at,
             u.username as author_name, up.full_name as author_full_name, up.avatar_url as author_avatar,
             pc.name as category_name,
             (SELECT COUNT(*) FROM reactions WHERE target_type = 'post' AND target_id = p.id) as total_reactions,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND deleted_at IS NULL) as total_comments,
             (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as total_shares
    `;

    if (userId) {
      query += `,
        (SELECT reaction_type FROM reactions WHERE target_type = 'post' AND target_id = p.id AND user_id = ?) as user_reaction
      `;
      params.push(userId);
    }

    query += `
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN profiles up ON u.id = up.user_id
      LEFT JOIN post_categories pc ON p.category_id = pc.id
      WHERE p.deleted_at IS NULL
    `;

    if (filters.author_id) {
      query += " AND p.author_id = ?";
      params.push(filters.author_id);
    }

    if (filters.category_id) {
      query += " AND p.category_id = ?";
      params.push(filters.category_id);
    }

    if (filters.department_id) {
      query += ' AND (p.visibility = "company" OR p.department_id = ?)';
      params.push(filters.department_id);
    }

    if (filters.search) {
      query += " AND (p.title LIKE ? OR p.content LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += " ORDER BY p.pinned DESC, p.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    // Debug logging
    const placeholderCount = (query.match(/\?/g) || []).length;
    if (placeholderCount !== params.length) {
      console.error(
        `[Post.getAll] Placeholder mismatch! Query has ${placeholderCount} but params has ${params.length}`
      );
      console.error("Params:", params);
    }

    const [rows] = await db.query(query, params);
    return rows;
  }

  async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.title) {
      fields.push("title = ?");
      values.push(updateData.title);
    }
    if (updateData.content !== undefined) {
      fields.push("content = ?");
      values.push(updateData.content);
    }
    if (updateData.visibility) {
      fields.push("visibility = ?");
      values.push(updateData.visibility);
    }

    if (fields.length > 0) {
      fields.push("updated_at = NOW()");
      values.push(id);
      await db.execute(
        `UPDATE posts SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    }
  }

  async softDelete(id, deletedBy) {
    await db.execute(
      `UPDATE posts SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
      [deletedBy, id]
    );
  }

  async togglePin(id, pinnedBy) {
    await db.execute(
      `UPDATE posts SET pinned = NOT pinned, pinned_by = ? WHERE id = ?`,
      [pinnedBy, id]
    );
  }

  async incrementViewCount(postId, userId) {
    await db.execute(
      `INSERT INTO post_views (post_id, user_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE viewed_at = NOW()`,
      [postId, userId]
    );
  }
}

module.exports = new PostModel();

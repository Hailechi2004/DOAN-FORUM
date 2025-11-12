const db = require("../config/database");

class Poll {
  static async create(data) {
    const { question, created_by, closes_at, allow_multiple } = data;

    const [result] = await db.query(
      `INSERT INTO polls (question, created_by, closes_at, allow_multiple, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [question, created_by, closes_at || null, allow_multiple || false]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        p.*,
        prof.full_name as creator_name,
        (SELECT COUNT(DISTINCT user_id) FROM poll_votes WHERE poll_id = p.id) as total_votes
       FROM polls p
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       WHERE p.id = ? AND p.is_deleted = FALSE`,
      [id]
    );

    if (rows.length === 0) return null;

    const poll = rows[0];
    const [options] = await db.query(
      `SELECT 
        po.*,
        (SELECT COUNT(*) FROM poll_votes WHERE option_id = po.id) as vote_count
       FROM poll_options po
       WHERE po.poll_id = ?
       ORDER BY po.option_order`,
      [id]
    );

    poll.options = options;
    return poll;
  }

  static async getAll(filters = {}) {
    const { created_by, active_only, search, page = 1, limit = 20 } = filters;

    let query = `
      SELECT 
        p.*,
        prof.full_name as creator_name,
        (SELECT COUNT(DISTINCT user_id) FROM poll_votes WHERE poll_id = p.id) as total_votes
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
      WHERE p.is_deleted = FALSE
    `;

    const params = [];

    if (created_by) {
      query += ` AND p.created_by = ?`;
      params.push(created_by);
    }
    if (active_only === "true") {
      query += ` AND (p.closes_at IS NULL OR p.closes_at > NOW())`;
    }
    if (search) {
      query += ` AND p.question LIKE ?`;
      params.push(`%${search}%`);
    }

    const countQuery = query.replace(
      /SELECT.*FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    const offset = (page - 1) * limit;
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    return {
      polls: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async addOption(pollId, optionText, optionOrder) {
    const [result] = await db.query(
      `INSERT INTO poll_options (poll_id, option_text, option_order) VALUES (?, ?, ?)`,
      [pollId, optionText, optionOrder]
    );

    return result.insertId;
  }

  static async vote(pollId, userId, optionIds) {
    // Check if already voted
    const [existing] = await db.query(
      `SELECT id FROM poll_votes WHERE poll_id = ? AND user_id = ?`,
      [pollId, userId]
    );

    if (existing.length > 0) {
      throw new Error("Already voted on this poll");
    }

    // Insert votes
    const votes = optionIds.map((optionId) => [
      pollId,
      optionId,
      userId,
      new Date(),
    ]);
    await db.query(
      `INSERT INTO poll_votes (poll_id, option_id, user_id, voted_at) VALUES ?`,
      [votes]
    );

    return true;
  }

  static async getResults(pollId) {
    const [options] = await db.query(
      `SELECT 
        po.id,
        po.option_text,
        po.option_order,
        COUNT(pv.id) as vote_count,
        (SELECT COUNT(DISTINCT user_id) FROM poll_votes WHERE poll_id = po.poll_id) as total_voters
       FROM poll_options po
       LEFT JOIN poll_votes pv ON po.id = pv.option_id
       WHERE po.poll_id = ?
       GROUP BY po.id
       ORDER BY po.option_order`,
      [pollId]
    );

    return options.map((opt) => ({
      ...opt,
      percentage:
        opt.total_voters > 0
          ? ((opt.vote_count / opt.total_voters) * 100).toFixed(2)
          : 0,
    }));
  }

  static async getUserVote(pollId, userId) {
    const [rows] = await db.query(
      `SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?`,
      [pollId, userId]
    );

    return rows.map((r) => r.option_id);
  }

  static async delete(id) {
    await db.query(`UPDATE polls SET deleted_at = NOW() WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = Poll;

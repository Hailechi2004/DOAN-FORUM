const db = require('../config/database');

class ReactionModel {
  async toggle(userId, targetType, targetId, reactionType) {
    // Check if reaction exists
    const [existing] = await db.execute(
      `SELECT * FROM reactions WHERE user_id = ? AND target_type = ? AND target_id = ?`,
      [userId, targetType, targetId]
    );

    if (existing.length > 0) {
      if (existing[0].reaction_type === reactionType) {
        // Remove reaction
        await db.execute(
          `DELETE FROM reactions WHERE user_id = ? AND target_type = ? AND target_id = ?`,
          [userId, targetType, targetId]
        );
        return { action: 'removed', reaction: null };
      } else {
        // Update reaction type
        await db.execute(
          `UPDATE reactions SET reaction_type = ?, created_at = NOW() 
           WHERE user_id = ? AND target_type = ? AND target_id = ?`,
          [reactionType, userId, targetType, targetId]
        );
        return { action: 'updated', reaction: reactionType };
      }
    } else {
      // Add new reaction
      await db.execute(
        `INSERT INTO reactions (user_id, target_type, target_id, reaction_type) 
         VALUES (?, ?, ?, ?)`,
        [userId, targetType, targetId, reactionType]
      );
      return { action: 'added', reaction: reactionType };
    }
  }

  async getReactions(targetType, targetId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username, up.full_name, up.avatar_url
       FROM reactions r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE r.target_type = ? AND r.target_id = ?
       ORDER BY r.created_at DESC`,
      [targetType, targetId]
    );
    return rows;
  }

  async getReactionsSummary(targetType, targetId) {
    const [rows] = await db.execute(
      `SELECT reaction_type, COUNT(*) as count
       FROM reactions
       WHERE target_type = ? AND target_id = ?
       GROUP BY reaction_type`,
      [targetType, targetId]
    );
    return rows;
  }
}

module.exports = new ReactionModel();

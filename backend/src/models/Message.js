const db = require('../config/database');

class MessageModel {
  async createConversation(conversationType, participantIds, createdBy, title = null) {
    const [result] = await db.execute(
      `INSERT INTO conversations (type, title, created_by) VALUES (?, ?, ?)`,
      [conversationType, title, createdBy]
    );

    const conversationId = result.insertId;

    // Add participants
    for (const userId of participantIds) {
      await db.execute(
        `INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`,
        [conversationId, userId]
      );
    }

    return conversationId;
  }

  async findConversation(userId1, userId2) {
    const [rows] = await db.execute(
      `SELECT DISTINCT cp1.conversation_id
       FROM conversation_participants cp1
       JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
       JOIN conversations c ON cp1.conversation_id = c.id
       WHERE cp1.user_id = ? AND cp2.user_id = ? AND c.type = 'direct'
       AND NOT EXISTS (
         SELECT 1 FROM conversation_participants cp3
         WHERE cp3.conversation_id = cp1.conversation_id
         AND cp3.user_id NOT IN (?, ?)
       )`,
      [userId1, userId2, userId1, userId2]
    );
    return rows[0]?.conversation_id;
  }

  async getUserConversations(userId) {
    const [rows] = await db.execute(
      `SELECT c.id, c.type, c.title, c.created_at, c.created_at as updated_at,
              (SELECT content FROM messages WHERE conversation_id = c.id 
               ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE conversation_id = c.id 
               ORDER BY created_at DESC LIMIT 1) as last_message_time,
              (SELECT COUNT(*) FROM messages m
               LEFT JOIN message_read_receipts mrr ON m.id = mrr.message_id AND mrr.user_id = ?
               WHERE m.conversation_id = c.id AND m.sender_id != ? 
              ) as unread_count,
              GROUP_CONCAT(
                CONCAT_WS('|', u.id, u.username, up.full_name, up.avatar_url)
                SEPARATOR '||'
              ) as participants
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       LEFT JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
       LEFT JOIN users u ON cp2.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE cp.user_id = ?
       GROUP BY c.id
       ORDER BY last_message_time DESC `,
      [userId, userId, userId, userId]
    );
    return rows;
  }

  async sendMessage(conversationId, senderId, content, attachments = []) {
    const [result] = await db.execute(
      `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
      [conversationId, senderId, content]
    );

    const messageId = result.insertId;

    // Add attachments
    for (const fileId of attachments) {
      await db.execute(
        `INSERT INTO message_attachments (message_id, file_id) VALUES (?, ?)`,
        [messageId, fileId]
      );
    }

    // Update conversation timestamp
    await db.execute(
      `UPDATE conversations SET updated_at = NOW() WHERE id = ?`,
      [conversationId]
    );

    return messageId;
  }

  async getMessages(conversationId, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT m.*, u.username as sender_name, up.full_name as sender_full_name,
              up.avatar_url as sender_avatar,
              GROUP_CONCAT(f.id, ':', f.original_name, ':', f.storage_path SEPARATOR '||') as attachments
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       LEFT JOIN message_attachments ma ON m.id = ma.message_id
       LEFT JOIN files f ON ma.file_id = f.id
       WHERE m.conversation_id = ? AND m.is_deleted = FALSE
       GROUP BY m.id
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );
    return rows.reverse();
  }

  async markAsRead(messageId, userId) {
    await db.execute(
      `INSERT INTO message_read_receipts (message_id, user_id) 
       VALUES (?, ?) ON DUPLICATE KEY UPDATE read_at = NOW()`,
      [messageId, userId]
    );
  }

  async setTypingStatus(conversationId, userId, isTyping) {
    if (isTyping) {
      await db.execute(
        `INSERT INTO typing_indicators (conversation_id, user_id) 
         VALUES (?, ?) ON DUPLICATE KEY UPDATE started_at = NOW()`,
        [conversationId, userId]
      );
    } else {
      await db.execute(
        `DELETE FROM typing_indicators WHERE conversation_id = ? AND user_id = ?`,
        [conversationId, userId]
      );
    }
  }

  async getTypingUsers(conversationId) {
    const [rows] = await db.execute(
      `SELECT ti.user_id, u.username, up.full_name
       FROM typing_indicators ti
       JOIN users u ON ti.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE ti.conversation_id = ? AND ti.started_at > DATE_SUB(NOW(), INTERVAL 5 SECOND)`,
      [conversationId]
    );
    return rows;
  }
}

module.exports = new MessageModel();

const db = require("../config/database");

// Helper to convert ISO datetime to MySQL format
function toMySQLDatetime(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

class Event {
  static async create(data) {
    const {
      title,
      description,
      location,
      start_time,
      end_time,
      created_by,
      reminder_minutes,
    } = data;

    const [result] = await db.query(
      `INSERT INTO events (title, description, location, start_time, end_time, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        description || null,
        location || null,
        toMySQLDatetime(start_time),
        end_time ? toMySQLDatetime(end_time) : toMySQLDatetime(start_time),
        created_by,
      ]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        e.*,
        prof.full_name as creator_name,
        d.name as department_name,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendee_count,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status = 'going') as accepted_count
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ? AND e.is_deleted = FALSE`,
      [id]
    );

    return rows[0];
  }

  static async getAll(filters = {}) {
    const {
      start_date,
      end_date,
      created_by,
      search,
      page = 1,
      limit = 20,
    } = filters;

    let query = `
      SELECT 
        e.*,
        prof.full_name as creator_name,
        d.name as department_name,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendee_count,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND status = 'going') as accepted_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.is_deleted = FALSE
    `;

    const params = [];

    if (start_date) {
      query += ` AND e.start_time >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND e.start_time <= ?`;
      params.push(end_date);
    }
    if (created_by) {
      query += ` AND e.created_by = ?`;
      params.push(created_by);
    }
    if (search) {
      query += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace(
      /SELECT.*FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    const offset = (page - 1) * limit;
    query += ` ORDER BY e.start_time ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    return {
      events: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAttendees(eventId) {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.username, up.full_name, up.avatar_url,
        ea.status,
        ea.joined_at
       FROM event_attendees ea
       INNER JOIN users u ON ea.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE ea.event_id = ?
       ORDER BY ea.joined_at DESC`,
      [eventId]
    );

    return rows;
  }

  static async addAttendee(eventId, userId, status = "going") {
    const [existing] = await db.query(
      `SELECT id FROM event_attendees WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE event_attendees SET status = ? WHERE event_id = ? AND user_id = ?`,
        [status, eventId, userId]
      );
    } else {
      await db.query(
        `INSERT INTO event_attendees (event_id, user_id, status, joined_at) VALUES (?, ?, ?, NOW())`,
        [eventId, userId, status]
      );
    }
    return true;
  }

  static async removeAttendee(eventId, userId) {
    const [result] = await db.query(
      `DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );
    return result.affectedRows > 0;
  }

  static async update(id, data) {
    const {
      title,
      description,
      location,
      start_time,
      end_time,
      reminder_minutes,
    } = data;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (location !== undefined) {
      updates.push("location = ?");
      params.push(location);
    }
    if (start_time !== undefined) {
      updates.push("start_time = ?");
      params.push(toMySQLDatetime(start_time));
    }
    if (end_time !== undefined) {
      updates.push("end_time = ?");
      params.push(toMySQLDatetime(end_time));
    }

    if (reminder_minutes !== undefined) {
      updates.push("reminder_minutes = ?");
      params.push(reminder_minutes);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE events SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.query(`UPDATE events SET is_deleted = TRUE WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = Event;

const db = require("../config/database");

// Helper to convert ISO datetime to MySQL format
function toMySQLDatetime(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

class Meeting {
  static async create(data) {
    const {
      title,
      description,
      start_time,
      scheduled_time, // fallback for old API
      end_time,
      duration_minutes,
      location,
      meeting_link,
      organizer_id,
      department_id,
      department_ids, // NEW: support multiple departments
      recurrence,
    } = data;

    const actualStartTime = start_time || scheduled_time;
    if (!actualStartTime) {
      throw new Error("start_time or scheduled_time is required");
    }

    const recurrenceJson = recurrence ? JSON.stringify(recurrence) : null;

    // Keep single department_id for backward compatibility
    const singleDeptId =
      department_ids && department_ids.length > 0
        ? department_ids[0]
        : department_id || null;

    const [result] = await db.query(
      `INSERT INTO meetings (title, description, start_time, end_time, location, meeting_link, organizer_id, department_id, recurrence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        description || null,
        toMySQLDatetime(actualStartTime),
        end_time ? toMySQLDatetime(end_time) : null,
        location || null,
        meeting_link || null,
        organizer_id,
        singleDeptId,
        recurrenceJson,
      ]
    );

    const meetingId = result.insertId;

    // Insert into junction table if department_ids provided
    if (department_ids && department_ids.length > 0) {
      const values = department_ids.map((deptId) => [meetingId, deptId]);
      await db.query(
        `INSERT INTO meeting_departments (meeting_id, department_id) VALUES ?
         ON DUPLICATE KEY UPDATE meeting_id = meeting_id`,
        [values]
      );
    } else if (department_id) {
      // Fallback: single department_id
      await db.query(
        `INSERT INTO meeting_departments (meeting_id, department_id) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE meeting_id = meeting_id`,
        [meetingId, department_id]
      );
    }

    return this.findById(meetingId);
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        m.*,
        prof.full_name as creator_name,
        d.name as department_name,
        (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id) as attendee_count,
        (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id AND status = 'accepted') as accepted_count
       FROM meetings m
       LEFT JOIN users u ON m.organizer_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       LEFT JOIN departments d ON m.department_id = d.id
       WHERE m.id = ? AND m.is_cancelled = 0`,
      [id]
    );

    if (rows[0]) {
      // Parse recurrence JSON
      if (rows[0].recurrence) {
        try {
          rows[0].recurrence = JSON.parse(rows[0].recurrence);
        } catch (e) {
          rows[0].recurrence = null;
        }
      }

      // Get all departments from junction table
      const [deptRows] = await db.query(
        `SELECT d.id, d.name, d.code
         FROM meeting_departments md
         JOIN departments d ON md.department_id = d.id
         WHERE md.meeting_id = ?`,
        [id]
      );
      rows[0].departments = deptRows;
      rows[0].department_ids = deptRows.map((d) => d.id);
    }

    return rows[0];
  }

  static async getAll(filters = {}) {
    const {
      start_date,
      end_date,
      organizer_id,
      department_id,
      search,
      page = 1,
      limit = 20,
    } = filters;

    let query = `
      SELECT 
        m.*,
        prof.full_name as creator_name,
        d.name as department_name,
        GROUP_CONCAT(DISTINCT dept.name SEPARATOR ', ') as department_names,
        (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id) as attendee_count,
        (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id AND status = 'accepted') as accepted_count
      FROM meetings m
      LEFT JOIN users u ON m.organizer_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      LEFT JOIN departments d ON m.department_id = d.id
      LEFT JOIN meeting_departments md ON m.id = md.meeting_id
      LEFT JOIN departments dept ON md.department_id = dept.id
      WHERE m.is_cancelled = 0
    `;

    const params = [];

    if (start_date) {
      query += ` AND m.start_time >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND m.start_time <= ?`;
      params.push(end_date);
    }
    if (organizer_id) {
      query += ` AND m.organizer_id = ?`;
      params.push(organizer_id);
    }
    if (department_id) {
      query += ` AND (m.department_id = ? OR md.department_id = ?)`;
      params.push(department_id, department_id);
    }
    if (search) {
      query += ` AND (m.title LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY m.id`;

    // Count query - use a simpler approach
    const countQuery = `
      SELECT COUNT(DISTINCT m.id) as total 
      FROM meetings m
      LEFT JOIN departments d ON m.department_id = d.id
      LEFT JOIN meeting_departments md ON m.id = md.meeting_id
      LEFT JOIN departments dept ON md.department_id = dept.id
      WHERE m.is_cancelled = 0
      ${start_date ? " AND m.start_time >= ?" : ""}
      ${end_date ? " AND m.start_time <= ?" : ""}
      ${organizer_id ? " AND m.organizer_id = ?" : ""}
      ${department_id ? " AND (m.department_id = ? OR md.department_id = ?)" : ""}
      ${search ? " AND (m.title LIKE ? OR m.description LIKE ?)" : ""}
    `;

    const [countResult] = await db.query(countQuery, params.slice(0));
    const total = countResult && countResult[0] ? countResult[0].total : 0;

    const offset = (page - 1) * limit;
    query += ` ORDER BY m.start_time ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    // Parse recurrence JSON and get department arrays for each meeting
    for (const row of rows) {
      if (row.recurrence) {
        try {
          row.recurrence = JSON.parse(row.recurrence);
        } catch (e) {
          row.recurrence = null;
        }
      }

      // Get departments array from junction table
      const [deptRows] = await db.query(
        `SELECT d.id, d.name, d.code
         FROM meeting_departments md
         JOIN departments d ON md.department_id = d.id
         WHERE md.meeting_id = ?`,
        [row.id]
      );
      row.departments = deptRows;
      row.department_ids = deptRows.map((d) => d.id);
    }

    return {
      meetings: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getParticipants(meetingId) {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.email,
        u.username,
        up.full_name,
        up.avatar_url,
        mp.status,
        mp.joined_at
       FROM meeting_participants mp
       INNER JOIN users u ON mp.user_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
       WHERE mp.meeting_id = ?
       ORDER BY mp.joined_at`,
      [meetingId]
    );

    return rows;
  }

  // New method: Get attendees (from meeting_attendees table)
  static async getAttendees(meetingId) {
    const [rows] = await db.query(
      `SELECT 
        u.id,
        u.email,
        u.username,
        prof.full_name,
        prof.avatar_url,
        ma.status,
        ma.notified,
        ma.reminder_sent
       FROM meeting_attendees ma
       INNER JOIN users u ON ma.user_id = u.id
       LEFT JOIN profiles prof ON u.id = prof.user_id
       WHERE ma.meeting_id = ?
       ORDER BY ma.user_id`,
      [meetingId]
    );

    return rows;
  }

  // New method: Add multiple attendees
  static async addAttendees(meetingId, userIds) {
    const values = userIds.map((userId) => [meetingId, userId, "invited"]);

    if (values.length === 0) return true;

    await db.query(
      `INSERT INTO meeting_attendees (meeting_id, user_id, status) 
       VALUES ? 
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [values]
    );
    return true;
  }

  // New method: Remove attendee
  static async removeAttendee(meetingId, userId) {
    const [result] = await db.query(
      `DELETE FROM meeting_attendees WHERE meeting_id = ? AND user_id = ?`,
      [meetingId, userId]
    );
    return result.affectedRows > 0;
  }

  // New method: Update attendee status
  static async updateAttendeeStatus(meetingId, userId, status) {
    await db.query(
      `UPDATE meeting_attendees 
       SET status = ?, updated_at = NOW() 
       WHERE meeting_id = ? AND user_id = ?`,
      [status, meetingId, userId]
    );
    return true;
  }

  // New method: Get attachments
  static async getAttachments(meetingId) {
    const [rows] = await db.query(
      `SELECT 
        ma.id,
        ma.file_id,
        ma.description,
        f.original_name,
        f.storage_path,
        f.size_bytes,
        f.mime_type
       FROM meeting_attachments ma
       INNER JOIN files f ON ma.file_id = f.id
       WHERE ma.meeting_id = ?
       ORDER BY ma.id DESC`,
      [meetingId]
    );

    return rows;
  }

  // New method: Add attachment
  static async addAttachment(meetingId, data) {
    const { file_id, description } = data;

    await db.query(
      `INSERT INTO meeting_attachments (meeting_id, file_id, description, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [meetingId, file_id, description || null]
    );
    return true;
  }

  // New method: Remove attachment
  static async removeAttachment(meetingId, attachmentId) {
    const [result] = await db.query(
      `DELETE FROM meeting_attachments 
       WHERE id = ? AND meeting_id = ?`,
      [attachmentId, meetingId]
    );
    return result.affectedRows > 0;
  }

  static async addParticipant(meetingId, userId, status = "invited") {
    const [existing] = await db.query(
      `SELECT id FROM meeting_participants WHERE meeting_id = ? AND user_id = ?`,
      [meetingId, userId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE meeting_participants SET status = ? WHERE meeting_id = ? AND user_id = ?`,
        [status, meetingId, userId]
      );
    } else {
      await db.query(
        `INSERT INTO meeting_participants (meeting_id, user_id, status, joined_at) VALUES (?, ?, ?, NOW())`,
        [meetingId, userId, status]
      );
    }
    return true;
  }

  static async removeParticipant(meetingId, userId) {
    const [result] = await db.query(
      `DELETE FROM meeting_participants WHERE meeting_id = ? AND user_id = ?`,
      [meetingId, userId]
    );
    return result.affectedRows > 0;
  }

  static async update(id, data) {
    const {
      title,
      description,
      start_time,
      end_time,
      location,
      meeting_link,
      department_id,
      department_ids, // NEW: support multiple departments
      recurrence,
      is_cancelled,
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
    if (start_time !== undefined) {
      updates.push("start_time = ?");
      params.push(toMySQLDatetime(start_time));
    }
    if (end_time !== undefined) {
      updates.push("end_time = ?");
      params.push(toMySQLDatetime(end_time));
    }
    if (location !== undefined) {
      updates.push("location = ?");
      params.push(location);
    }
    if (meeting_link !== undefined) {
      updates.push("meeting_link = ?");
      params.push(meeting_link);
    }
    if (department_id !== undefined) {
      updates.push("department_id = ?");
      params.push(department_id || null);
    }
    if (recurrence !== undefined) {
      updates.push("recurrence = ?");
      params.push(recurrence ? JSON.stringify(recurrence) : null);
    }
    if (is_cancelled !== undefined) {
      updates.push("is_cancelled = ?");
      params.push(is_cancelled ? 1 : 0);
    }

    if (updates.length === 0 && !department_ids) return this.findById(id);

    updates.push("updated_at = NOW()");
    params.push(id);

    await db.query(
      `UPDATE meetings SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    // Update junction table if department_ids provided
    if (department_ids !== undefined) {
      // Delete existing department associations
      await db.query(`DELETE FROM meeting_departments WHERE meeting_id = ?`, [
        id,
      ]);

      // Insert new associations
      if (department_ids && department_ids.length > 0) {
        const values = department_ids.map((deptId) => [id, deptId]);
        await db.query(
          `INSERT INTO meeting_departments (meeting_id, department_id) VALUES ?`,
          [values]
        );

        // Update single department_id for backward compatibility (use first department)
        await db.query(`UPDATE meetings SET department_id = ? WHERE id = ?`, [
          department_ids[0],
          id,
        ]);
      }
    }

    return this.findById(id);
  }

  static async delete(id) {
    await db.query(
      `UPDATE meetings SET is_cancelled = 1, updated_at = NOW() WHERE id = ?`,
      [id]
    );
    return true;
  }

  // ============ JITSI MEETING METHODS ============

  /**
   * Start a Jitsi meeting - updates meeting_link with generated Jitsi URL
   * @param {number} id - Meeting ID
   * @param {string} jitsiLink - Generated Jitsi meeting link
   * @param {string} roomName - Jitsi room name
   * @returns {Object} Updated meeting
   */
  static async startMeeting(id, jitsiLink, roomName, startedBy) {
    await db.query(
      `UPDATE meetings 
       SET meeting_link = ?, 
           updated_at = NOW() 
       WHERE id = ?`,
      [jitsiLink, id]
    );

    // Create meeting_sessions record
    const [result] = await db.query(
      `INSERT INTO meeting_sessions 
       (meeting_id, jitsi_room_id, started_at, started_by)
       VALUES (?, ?, NOW(), ?)`,
      [id, roomName, startedBy]
    );

    const sessionId = result.insertId;
    return { meeting: await this.findById(id), sessionId };
  }

  /**
   * End a Jitsi meeting - marks meeting as ended
   * @param {number} id - Meeting ID
   * @returns {Object} Updated meeting
   */
  static async endMeeting(id, endedBy) {
    // Update meeting_sessions table
    await db.query(
      `UPDATE meeting_sessions 
       SET ended_at = NOW(), 
           ended_by = ?,
           duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW())
       WHERE meeting_id = ? AND ended_at IS NULL`,
      [endedBy, id]
    );

    // Mark all active participants as left
    await db.query(
      `UPDATE meeting_active_participants 
       SET left_at = NOW(),
           is_active = FALSE,
           duration_seconds = TIMESTAMPDIFF(SECOND, joined_at, NOW())
       WHERE meeting_id = ? AND is_active = TRUE AND left_at IS NULL`,
      [id]
    );

    return this.findById(id);
  }

  /**
   * Track user joining a meeting
   * @param {number} meetingId - Meeting ID
   * @param {number} userId - User ID
   * @returns {boolean} Success
   */
  static async trackJoin(meetingId, userId) {
    // Check if user is already an attendee/participant
    const [existing] = await db.query(
      `SELECT * FROM meeting_attendees WHERE meeting_id = ? AND user_id = ?`,
      [meetingId, userId]
    );

    if (existing.length === 0) {
      // Add as participant if not already in attendees
      await db.query(
        `INSERT IGNORE INTO meeting_participants (meeting_id, user_id, status, joined_at)
         VALUES (?, ?, 'accepted', NOW())`,
        [meetingId, userId]
      );
    }

    // Get active session ID
    const [sessions] = await db.query(
      `SELECT id FROM meeting_sessions 
       WHERE meeting_id = ? AND ended_at IS NULL 
       ORDER BY started_at DESC LIMIT 1`,
      [meetingId]
    );

    const sessionId = sessions.length > 0 ? sessions[0].id : null;

    // Track in meeting_active_participants
    await db.query(
      `INSERT INTO meeting_active_participants 
       (meeting_id, user_id, session_id, joined_at, is_active)
       VALUES (?, ?, ?, NOW(), TRUE)`,
      [meetingId, userId, sessionId]
    );

    return true;
  }

  /**
   * Track user leaving a meeting
   * @param {number} meetingId - Meeting ID
   * @param {number} userId - User ID
   * @returns {boolean} Success
   */
  static async trackLeave(meetingId, userId) {
    // Update meeting_active_participants
    await db.query(
      `UPDATE meeting_active_participants 
       SET left_at = NOW(),
           is_active = FALSE,
           duration_seconds = TIMESTAMPDIFF(SECOND, joined_at, NOW())
       WHERE meeting_id = ? AND user_id = ? AND is_active = TRUE AND left_at IS NULL`,
      [meetingId, userId]
    );

    return true;
  }

  /**
   * Get active participants in a meeting
   * @param {number} meetingId - Meeting ID
   * @returns {Array} List of active participants
   */
  static async getActiveParticipants(meetingId) {
    // Query meeting_active_participants for real-time data
    const [participants] = await db.query(
      `SELECT 
        map.id,
        map.user_id,
        map.joined_at,
        map.left_at,
        map.is_active,
        map.duration_seconds,
        map.device_type,
        map.connection_quality,
        TIMESTAMPDIFF(SECOND, map.joined_at, NOW()) as seconds_in_meeting,
        u.username,
        u.full_name,
        u.email,
        u.avatar_url
       FROM meeting_active_participants map
       JOIN users u ON map.user_id = u.id
       WHERE map.meeting_id = ?
         AND map.is_active = TRUE
         AND map.left_at IS NULL
       ORDER BY map.joined_at ASC`,
      [meetingId]
    );

    return participants;
  }

  /**
   * Get meeting session history
   * @param {number} meetingId - Meeting ID
   * @returns {Array} List of session records
   */
  static async getMeetingSessions(meetingId) {
    const [sessions] = await db.query(
      `SELECT 
        ms.*,
        u1.full_name as started_by_name,
        u2.full_name as ended_by_name,
        CASE 
          WHEN ms.ended_at IS NULL THEN 'active'
          ELSE 'ended'
        END as status
       FROM meeting_sessions ms
       LEFT JOIN users u1 ON ms.started_by = u1.id
       LEFT JOIN users u2 ON ms.ended_by = u2.id
       WHERE ms.meeting_id = ?
       ORDER BY ms.started_at DESC`,
      [meetingId]
    );

    return sessions;
  }

  /**
   * Get current active session for a meeting
   * @param {number} meetingId - Meeting ID
   * @returns {Object|null} Active session or null
   */
  static async getActiveSession(meetingId) {
    const [sessions] = await db.query(
      `SELECT * FROM meeting_sessions 
       WHERE meeting_id = ? AND ended_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [meetingId]
    );

    return sessions.length > 0 ? sessions[0] : null;
  }

  /**
   * Get meeting statistics
   * @param {number} meetingId - Meeting ID
   * @returns {Object} Meeting stats
   */
  static async getMeetingStats(meetingId) {
    const [stats] = await db.query(
      `SELECT 
        COUNT(DISTINCT ms.id) as total_sessions,
        SUM(ms.duration_seconds) as total_duration_seconds,
        AVG(ms.duration_seconds) as avg_duration_seconds,
        MAX(ms.max_concurrent_participants) as max_concurrent_participants,
        COUNT(DISTINCT map.user_id) as unique_participants_all_time,
        SUM(CASE WHEN ms.recording_status = 'available' THEN 1 ELSE 0 END) as recorded_sessions_count
       FROM meeting_sessions ms
       LEFT JOIN meeting_active_participants map ON ms.id = map.session_id
       WHERE ms.meeting_id = ?`,
      [meetingId]
    );

    return stats.length > 0 ? stats[0] : null;
  }

  /**
   * Log meeting event
   * @param {number} meetingId - Meeting ID
   * @param {string} eventType - Event type
   * @param {number} userId - User ID who triggered event
   * @param {Object} eventData - Additional event data
   */
  static async logMeetingEvent(meetingId, eventType, userId, eventData = null) {
    // Get current session
    const session = await this.getActiveSession(meetingId);
    const sessionId = session ? session.id : null;

    await db.query(
      `INSERT INTO meeting_events 
       (meeting_id, session_id, user_id, event_type, event_data)
       VALUES (?, ?, ?, ?, ?)`,
      [
        meetingId,
        sessionId,
        userId,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
      ]
    );
  }

  /**
   * Get meeting events log
   * @param {number} meetingId - Meeting ID
   * @param {number} limit - Number of events to return
   * @returns {Array} List of events
   */
  static async getMeetingEvents(meetingId, limit = 50) {
    const [events] = await db.query(
      `SELECT 
        me.*,
        u.full_name as user_name,
        u.username
       FROM meeting_events me
       LEFT JOIN users u ON me.user_id = u.id
       WHERE me.meeting_id = ?
       ORDER BY me.created_at DESC
       LIMIT ?`,
      [meetingId, limit]
    );

    return events;
  }
}

module.exports = Meeting;

const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "forum_database",
};

async function checkEventsTables() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database\n");

    // 1. Kiểm tra bảng events
    console.log("📋 TABLE: events");
    console.log("=".repeat(80));
    const [eventsSchema] = await connection.query(`
      DESCRIBE events
    `);
    console.table(eventsSchema);

    const [eventsCount] = await connection.query(
      "SELECT COUNT(*) as count FROM events"
    );
    console.log(`Total events: ${eventsCount[0].count}\n`);

    // Sample data
    const [eventsSample] = await connection.query(
      "SELECT * FROM events LIMIT 3"
    );
    console.log("Sample events data:");
    console.table(eventsSample);
    console.log("\n");

    // 2. Kiểm tra bảng event_attendees
    console.log("📋 TABLE: event_attendees");
    console.log("=".repeat(80));
    const [attendeesSchema] = await connection.query(`
      DESCRIBE event_attendees
    `);
    console.table(attendeesSchema);

    const [attendeesCount] = await connection.query(
      "SELECT COUNT(*) as count FROM event_attendees"
    );
    console.log(`Total attendees: ${attendeesCount[0].count}\n`);

    // Sample data
    const [attendeesSample] = await connection.query(
      "SELECT * FROM event_attendees LIMIT 3"
    );
    console.log("Sample event_attendees data:");
    console.table(attendeesSample);
    console.log("\n");

    // 3. Kiểm tra bảng meetings (nếu có)
    try {
      console.log("📋 TABLE: meetings");
      console.log("=".repeat(80));
      const [meetingsSchema] = await connection.query(`
        DESCRIBE meetings
      `);
      console.table(meetingsSchema);

      const [meetingsCount] = await connection.query(
        "SELECT COUNT(*) as count FROM meetings"
      );
      console.log(`Total meetings: ${meetingsCount[0].count}\n`);

      const [meetingsSample] = await connection.query(
        "SELECT * FROM meetings LIMIT 3"
      );
      console.log("Sample meetings data:");
      console.table(meetingsSample);
      console.log("\n");
    } catch (error) {
      console.log('❌ Table "meetings" does not exist\n');
    }

    // 4. Kiểm tra bảng meeting_attendees (nếu có)
    try {
      console.log("📋 TABLE: meeting_attendees");
      console.log("=".repeat(80));
      const [meetingAttendeesSchema] = await connection.query(`
        DESCRIBE meeting_attendees
      `);
      console.table(meetingAttendeesSchema);

      const [meetingAttendeesCount] = await connection.query(
        "SELECT COUNT(*) as count FROM meeting_attendees"
      );
      console.log(
        `Total meeting attendees: ${meetingAttendeesCount[0].count}\n`
      );
    } catch (error) {
      console.log('❌ Table "meeting_attendees" does not exist\n');
    }

    // 5. Kiểm tra bảng meeting_attachments (nếu có)
    try {
      console.log("📋 TABLE: meeting_attachments");
      console.log("=".repeat(80));
      const [meetingAttachmentsSchema] = await connection.query(`
        DESCRIBE meeting_attachments
      `);
      console.table(meetingAttachmentsSchema);

      const [meetingAttachmentsCount] = await connection.query(
        "SELECT COUNT(*) as count FROM meeting_attachments"
      );
      console.log(
        `Total meeting attachments: ${meetingAttachmentsCount[0].count}\n`
      );
    } catch (error) {
      console.log('❌ Table "meeting_attachments" does not exist\n');
    }

    // 6. Thống kê events
    console.log("📊 EVENTS STATISTICS");
    console.log("=".repeat(80));
    const [eventStats] = await connection.query(`
      SELECT 
        is_public,
        COUNT(*) as total_events,
        COUNT(DISTINCT created_by) as unique_creators
      FROM events
      WHERE is_deleted = 0
      GROUP BY is_public
    `);
    console.table(eventStats);
    console.log("\n");

    // 7. Kiểm tra relationship giữa events và attendees
    console.log("🔗 EVENTS WITH ATTENDEES");
    console.log("=".repeat(80));
    const [eventsWithAttendees] = await connection.query(`
      SELECT 
        e.id,
        e.title,
        e.start_time,
        e.end_time,
        e.location,
        e.is_public,
        COUNT(ea.user_id) as attendee_count,
        SUM(CASE WHEN ea.status = 'going' THEN 1 ELSE 0 END) as going,
        SUM(CASE WHEN ea.status = 'maybe' THEN 1 ELSE 0 END) as maybe,
        SUM(CASE WHEN ea.status = 'not_going' THEN 1 ELSE 0 END) as not_going
      FROM events e
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      WHERE e.is_deleted = 0
      GROUP BY e.id
      ORDER BY e.start_time DESC
      LIMIT 5
    `);
    console.table(eventsWithAttendees);
    console.log("\n");

    // 8. Kiểm tra events được tạo bởi ai
    console.log("👤 EVENTS BY CREATOR");
    console.log("=".repeat(80));
    const [eventsByCreator] = await connection.query(`
      SELECT 
        u.full_name as creator_name,
        u.email,
        COUNT(e.id) as total_events
      FROM events e
      JOIN users u ON e.created_by = u.id
      GROUP BY e.created_by
      ORDER BY total_events DESC
      LIMIT 5
    `);
    console.table(eventsByCreator);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n✅ Connection closed");
    }
  }
}

checkEventsTables();

const mysql = require("mysql2/promise");

async function addDepartmentParticipants() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "company_forum",
    });

    console.log("✅ Connected to database\n");

    // 1. Check and add department_id to events table
    console.log("📋 Step 1: Adding department_id to events table...");
    const [eventColumns] = await connection.query(
      "SHOW COLUMNS FROM events LIKE 'department_id'"
    );

    if (eventColumns.length === 0) {
      await connection.query(`
        ALTER TABLE events 
        ADD COLUMN department_id BIGINT NULL
        AFTER creator_id
      `);
      console.log("✅ Added department_id column to events table");

      await connection.query(`
        ALTER TABLE events 
        ADD CONSTRAINT fk_events_department 
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      `);
      console.log("✅ Added foreign key constraint");

      await connection.query(`
        ALTER TABLE events 
        ADD INDEX idx_events_department (department_id)
      `);
      console.log("✅ Added index on department_id");
    } else {
      console.log("✓ events.department_id already exists");
    }

    // 2. Create department_participants table for tracking participants added by department managers
    console.log("\n📋 Step 2: Creating department_participants table...");
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'department_participants'"
    );

    if (tables.length === 0) {
      await connection.query(`
        CREATE TABLE department_participants (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          event_id BIGINT NULL,
          meeting_id BIGINT NULL,
          user_id BIGINT NOT NULL,
          added_by BIGINT NOT NULL COMMENT 'User ID who added this participant (usually department manager)',
          department_id BIGINT NOT NULL COMMENT 'Department that added this participant',
          status ENUM('invited', 'accepted', 'declined', 'tentative') DEFAULT 'invited',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
          INDEX idx_event_id (event_id),
          INDEX idx_meeting_id (meeting_id),
          INDEX idx_user_id (user_id),
          INDEX idx_department_id (department_id),
          UNIQUE KEY unique_event_user (event_id, user_id),
          UNIQUE KEY unique_meeting_user (meeting_id, user_id),
          CHECK (
            (event_id IS NOT NULL AND meeting_id IS NULL) OR 
            (event_id IS NULL AND meeting_id IS NOT NULL)
          )
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ Created department_participants table");
    } else {
      console.log("✓ department_participants table already exists");
    }

    // 3. Verify
    console.log("\n📊 VERIFICATION:");
    
    console.log("\n▶ Events table structure:");
    const [eventsStructure] = await connection.query(
      "DESCRIBE events"
    );
    console.table(eventsStructure);

    console.log("\n▶ Department_participants table structure:");
    const [dpStructure] = await connection.query(
      "DESCRIBE department_participants"
    );
    console.table(dpStructure);

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📝 Summary:");
    console.log("  - events.department_id: Added for department-based events");
    console.log("  - department_participants: Track participants added by department managers");
    console.log("  - Both tables ready for admin and manager workflows");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addDepartmentParticipants();

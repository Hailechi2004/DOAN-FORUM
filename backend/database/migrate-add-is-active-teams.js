const mysql = require("mysql2/promise");

async function addIsActiveToTeams() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "company_forum",
    });

    console.log("✅ Connected to database\n");

    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM teams LIKE 'is_active'"
    );

    if (columns.length > 0) {
      console.log("✓ Column 'is_active' already exists in teams table");
      return;
    }

    // Add is_active column
    await connection.query(`
      ALTER TABLE teams 
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE 
      AFTER created_at
    `);
    console.log("✅ Added column 'is_active' to teams table");

    // Add index
    await connection.query(`
      ALTER TABLE teams 
      ADD INDEX idx_is_active (is_active)
    `);
    console.log("✅ Added index 'idx_is_active' to teams table");

    // Verify
    const [result] = await connection.query("SHOW COLUMNS FROM teams");
    console.log("\n📊 Teams table columns:");
    console.table(result);

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addIsActiveToTeams();

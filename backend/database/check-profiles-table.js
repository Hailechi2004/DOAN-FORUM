require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkProfilesTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "dacn",
    });

    console.log("🔍 Checking profiles table...\n");

    // Show all tables with 'profile' in name
    const [tables] = await connection.query("SHOW TABLES LIKE '%profile%'");
    console.log("Tables with 'profile' in name:");
    tables.forEach((t) => {
      console.log(`   - ${Object.values(t)[0]}`);
    });

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
  }
}

checkProfilesTable();

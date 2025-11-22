const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkUsersTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "forum_database",
  });

  try {
    console.log("📋 Users table structure:\n");
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM users
    `);

    columns.forEach((col) => {
      console.log(
        `- ${col.Field} (${col.Type}) ${col.Null === "NO" ? "NOT NULL" : "NULL"} ${col.Key ? `[${col.Key}]` : ""}`
      );
    });

    console.log("\n\n📋 Sample users data:\n");
    const [users] = await connection.execute(`
      SELECT * FROM users LIMIT 3
    `);

    console.log(users);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkUsersTable();

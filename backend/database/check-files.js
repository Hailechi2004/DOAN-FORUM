require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkFiles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "company_forum",
    charset: "utf8mb4",
  });

  try {
    console.log("=== FILES TABLE ===\n");

    const [columns] = await connection.query("DESCRIBE files");
    console.log("Columns:");
    columns.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkFiles();

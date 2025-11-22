require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkAttachments() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "company_forum",
    charset: "utf8mb4",
  });

  try {
    console.log("=== POST_ATTACHMENTS TABLE ===\n");

    // Check structure
    const [columns] = await connection.query("DESCRIBE post_attachments");
    console.log("Columns:");
    columns.forEach((c) =>
      console.log(
        `  ${c.Field} (${c.Type}) ${c.Null === "NO" ? "NOT NULL" : "NULL"}`
      )
    );

    // Check data
    const [attachments] = await connection.query(`
      SELECT pa.*, p.title 
      FROM post_attachments pa
      LEFT JOIN posts p ON pa.post_id = p.id
      LIMIT 10
    `);
    console.log(`\nTotal attachments: ${attachments.length}`);
    if (attachments.length > 0) {
      console.log("\nSample:");
      attachments.forEach((a) => {
        console.log(
          `  Post: ${a.title} -> File: ${a.file_path} (${a.file_type})`
        );
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkAttachments();

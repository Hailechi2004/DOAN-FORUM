require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkUploadedFiles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "company_forum",
    charset: "utf8mb4",
  });

  try {
    console.log("=== CHECKING UPLOADED FILES ===\n");

    // Check files table
    const [files] = await connection.query(
      "SELECT * FROM files ORDER BY created_at DESC LIMIT 10"
    );
    console.log(`Files in database: ${files.length}`);
    if (files.length > 0) {
      files.forEach((f) => {
        console.log(
          `  ID: ${f.id}, Path: ${f.storage_path}, Uploader: ${f.uploader_id}`
        );
      });
    }

    // Check post_attachments
    console.log("\n--- POST ATTACHMENTS ---");
    const [attachments] = await connection.query(`
      SELECT pa.*, p.id as post_id, p.title, f.storage_path
      FROM post_attachments pa
      JOIN posts p ON pa.post_id = p.id
      JOIN files f ON pa.file_id = f.id
      ORDER BY pa.post_id DESC
      LIMIT 10
    `);
    console.log(`Attachments: ${attachments.length}`);
    if (attachments.length > 0) {
      attachments.forEach((a) => {
        console.log(`  Post #${a.post_id} (${a.title}) -> ${a.storage_path}`);
      });
    }

    // Check recent posts
    console.log("\n--- RECENT POSTS ---");
    const [posts] = await connection.query(`
      SELECT id, title, category_id, created_at
      FROM posts
      ORDER BY created_at DESC
      LIMIT 5
    `);
    posts.forEach((p) => {
      console.log(`  #${p.id}: ${p.title} (Category: ${p.category_id})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkUploadedFiles();

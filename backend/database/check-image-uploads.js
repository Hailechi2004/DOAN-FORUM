require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "company_forum",
    charset: "utf8mb4",
  });

  try {
    console.log("=== CHECKING IMAGE UPLOADS ===\n");

    // Check latest post
    const [posts] = await connection.query(`
      SELECT id, title, content, category_id, created_at 
      FROM posts 
      ORDER BY id DESC 
      LIMIT 5
    `);

    console.log("📝 Latest Posts:");
    posts.forEach((p) => {
      console.log(
        `  ID: ${p.id}, Title: ${p.title}, Category: ${p.category_id || "NULL"}`
      );
    });

    // Check files table
    const [files] = await connection.query(
      "SELECT * FROM files ORDER BY id DESC LIMIT 5"
    );
    console.log(`\n📁 Files table: ${files.length} records`);
    files.forEach((f) => {
      console.log(
        `  ID: ${f.id}, Path: ${f.storage_path}, Uploader: ${f.uploader_id}`
      );
    });

    // Check post_attachments table
    const [attachments] = await connection.query(`
      SELECT pa.*, p.title 
      FROM post_attachments pa
      LEFT JOIN posts p ON pa.post_id = p.id
      ORDER BY pa.id DESC 
      LIMIT 5
    `);
    console.log(`\n🖼️ Post Attachments: ${attachments.length} records`);
    attachments.forEach((a) => {
      console.log(
        `  Post: ${a.title}, File ID: ${a.file_id}, Type: ${a.attachment_type}`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkImages();

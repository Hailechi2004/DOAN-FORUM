require("dotenv").config();
const mysql = require("mysql2/promise");

async function verifyData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "company_forum",
    charset: "utf8mb4",
  });

  try {
    console.log("=== KIỂM TRA DỮ LIỆU ===\n");

    const [categories] = await connection.query(
      "SELECT * FROM post_categories"
    );
    console.log("📁 POST CATEGORIES:");
    categories.forEach((c) =>
      console.log(`  ${c.code}: ${c.name} - ${c.description}`)
    );

    const [posts] = await connection.query(`
      SELECT p.*, u.username, pc.name as category_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.category_id = pc.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    console.log("\n📝 POSTS:");
    posts.forEach((p) =>
      console.log(
        `  [${p.category_name || "No Category"}] ${p.content.substring(0, 50)}... by ${p.username}`
      )
    );

    const [users] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    const [comments] = await connection.query(
      "SELECT COUNT(*) as count FROM comments"
    );
    const [depts] = await connection.query(
      "SELECT COUNT(*) as count FROM departments"
    );

    console.log("\n📊 STATISTICS:");
    console.log(`  Users: ${users[0].count}`);
    console.log(`  Posts: ${posts.length}`);
    console.log(`  Comments: ${comments[0].count}`);
    console.log(`  Departments: ${depts[0].count}`);
    console.log(`  Categories: ${categories.length}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

verifyData();

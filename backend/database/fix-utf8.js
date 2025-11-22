const mysql = require("mysql2/promise");
require("dotenv").config();

const fixUTF8 = async () => {
  let connection;

  try {
    console.log("🔧 Đang kết nối database...\n");

    // Kết nối database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "company_forum",
      charset: "utf8mb4",
      multipleStatements: true,
    });

    console.log("✅ Đã kết nối thành công!\n");

    // 1. Fix database charset
    console.log("📦 Đang fix charset cho database...");
    await connection.query(
      `ALTER DATABASE company_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log("✅ Database charset fixed!\n");

    // 2. Fix tables charset
    console.log("📋 Đang fix charset cho các tables...");
    const tables = [
      "users",
      "profiles",
      "departments",
      "positions",
      "categories",
      "posts",
      "comments",
      "reactions",
      "bookmarks",
      "messages",
      "conversations",
      "notifications",
      "projects",
      "tasks",
      "teams",
      "events",
      "meetings",
      "polls",
      "files",
      "user_roles",
      "project_members",
      "team_members",
      "event_attendees",
      "conversation_participants",
    ];

    for (const table of tables) {
      try {
        await connection.query(
          `ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        console.log(`  ✅ ${table}`);
      } catch (err) {
        console.log(`  ⚠️  ${table} - ${err.message}`);
      }
    }

    console.log("\n📊 Kiểm tra kết quả...\n");
    const [rows] = await connection.query(`
      SELECT TABLE_NAME, TABLE_COLLATION
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'company_forum'
      ORDER BY TABLE_NAME
      LIMIT 10
    `);

    console.table(rows);

    console.log("\n✅ Hoàn tất fix UTF-8!");
    console.log("💡 Giờ hãy restart backend server: npm run dev\n");
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

fixUTF8();

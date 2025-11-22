const mysql = require("mysql2/promise");
require("dotenv").config();

const checkAllTables = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "company_forum",
      charset: "utf8mb4",
    });

    await connection.query("SET NAMES 'utf8mb4'");
    console.log("✅ Đã kết nối database\n");

    // Lấy danh sách tất cả các bảng
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_ROWS, TABLE_COLLATION
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'company_forum'
      ORDER BY TABLE_NAME
    `);

    console.log("📊 DANH SÁCH TẤT CẢ CÁC BẢNG:\n");
    console.log("=".repeat(100));
    console.log(`Tổng số bảng: ${tables.length}\n`);

    // Hiển thị từng bảng với số lượng records
    let totalRows = 0;
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const [countResult] = await connection.query(
        `SELECT COUNT(*) as total FROM ${table.TABLE_NAME}`
      );
      const actualCount = countResult[0].total;
      totalRows += actualCount;

      const status = actualCount > 0 ? "✅" : "⚪";
      const charset =
        table.TABLE_COLLATION === "utf8mb4_unicode_ci" ? "🟢" : "🔴";

      console.log(
        `${status} ${charset} ${(i + 1).toString().padStart(2, "0")}. ${table.TABLE_NAME.padEnd(35)} | Records: ${actualCount.toString().padStart(6)} | Charset: ${table.TABLE_COLLATION}`
      );
    }

    console.log("\n" + "=".repeat(100));
    console.log(`\n📈 TỔNG RECORDS TRONG DATABASE: ${totalRows}\n`);

    // Hiển thị chi tiết các bảng CÓ DỮ LIỆU
    console.log("\n📋 CHI TIẾT CÁC BẢNG CÓ DỮ LIỆU:\n");
    console.log("=".repeat(100));

    for (const table of tables) {
      const [countResult] = await connection.query(
        `SELECT COUNT(*) as total FROM ${table.TABLE_NAME}`
      );
      const count = countResult[0].total;

      if (count > 0) {
        console.log(
          `\n🔹 ${table.TABLE_NAME.toUpperCase()} (${count} records):`
        );
        console.log("-".repeat(100));

        // Lấy 3 records đầu tiên
        const [rows] = await connection.query(
          `SELECT * FROM ${table.TABLE_NAME} LIMIT 3`
        );

        if (rows.length > 0) {
          // Hiển thị tên cột
          const columns = Object.keys(rows[0]);
          console.log(`Columns: ${columns.join(", ")}`);
          console.log("");

          // Hiển thị dữ liệu (rút gọn nếu quá dài)
          rows.forEach((row, index) => {
            console.log(`  Record ${index + 1}:`);
            for (const [key, value] of Object.entries(row)) {
              let displayValue = value;
              if (typeof value === "string" && value.length > 80) {
                displayValue = value.substring(0, 77) + "...";
              }
              if (value === null) displayValue = "NULL";
              console.log(`    ${key}: ${displayValue}`);
            }
            console.log("");
          });
        }
      }
    }

    console.log("\n✅ Hoàn tất kiểm tra tất cả bảng!");
    console.log("\nChú thích:");
    console.log("✅ = Có dữ liệu | ⚪ = Không có dữ liệu");
    console.log("🟢 = UTF-8 OK | 🔴 = Charset sai\n");
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

checkAllTables();

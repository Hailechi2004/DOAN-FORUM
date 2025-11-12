const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "company_forum",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4",
  // Thêm các option này để đảm bảo UTF-8 hoạt động đúng
  typeCast: function (field, next) {
    if (
      field.type === "VAR_STRING" ||
      field.type === "STRING" ||
      field.type === "BLOB"
    ) {
      return field.string("utf8");
    }
    return next();
  },
});

// Test connection
pool
  .getConnection()
  .then(async (connection) => {
    console.log("✅ Database connected successfully");
    // Set UTF-8 cho connection
    await connection.query("SET NAMES 'utf8mb4'");
    await connection.query("SET CHARACTER SET utf8mb4");
    await connection.query("SET character_set_connection=utf8mb4");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;

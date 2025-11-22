const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function seedDepartmentsAndTeams() {
  let connection;

  try {
    // Kết nối database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "company_forum",
      multipleStatements: true,
      charset: "utf8mb4",
    });

    console.log("✅ Connected to database");

    // Đọc file SQL
    const sqlFile = path.join(__dirname, "seed-departments-teams.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Thực thi SQL
    console.log("📝 Executing SQL script...");
    await connection.query(sql);

    console.log("✅ Seed departments and teams completed!");

    // Kiểm tra kết quả
    const [depts] = await connection.query(
      "SELECT COUNT(*) as count FROM departments"
    );
    console.log(`📊 Total departments: ${depts[0].count}`);

    const [teams] = await connection.query(
      "SELECT COUNT(*) as count FROM teams"
    );
    console.log(`📊 Total teams: ${teams[0].count}`);

    const [empWithDept] = await connection.query(
      "SELECT COUNT(*) as count FROM employee_records WHERE department_id IS NOT NULL"
    );
    console.log(`📊 Employees with departments: ${empWithDept[0].count}`);

    const [empWithTeam] = await connection.query(
      "SELECT COUNT(*) as count FROM employee_records WHERE team_id IS NOT NULL"
    );
    console.log(`📊 Employees with teams: ${empWithTeam[0].count}`);

    const [teamMembers] = await connection.query(
      "SELECT COUNT(*) as count FROM team_members"
    );
    console.log(`📊 Total team members: ${teamMembers[0].count}`);
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

seedDepartmentsAndTeams();

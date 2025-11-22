const mysql = require("mysql2/promise");

async function checkData() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "company_forum",
    });

    console.log("✅ Connected to database\n");

    // Check departments
    const [depts] = await connection.query(
      "SELECT id, name, code FROM departments ORDER BY id LIMIT 20"
    );
    console.log("📋 DEPARTMENTS:");
    console.table(depts);

    // Check teams
    const [teams] = await connection.query(
      "SELECT id, name, department_id FROM teams ORDER BY id LIMIT 20"
    );
    console.log("\n📋 TEAMS:");
    console.table(teams);

    // Check employee_records
    const [empRecords] = await connection.query(
      "SELECT id, user_id, department_id, team_id, position FROM employee_records ORDER BY id LIMIT 20"
    );
    console.log("\n📋 EMPLOYEE RECORDS:");
    console.table(empRecords);

    // Check team_members
    const [teamMembers] = await connection.query(
      "SELECT * FROM team_members LIMIT 20"
    );
    console.log("\n📋 TEAM MEMBERS:");
    console.table(teamMembers);

    // Statistics
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM departments) as total_departments,
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM employee_records) as total_employees,
        (SELECT COUNT(*) FROM employee_records WHERE department_id IS NOT NULL) as employees_with_dept,
        (SELECT COUNT(*) FROM employee_records WHERE team_id IS NOT NULL) as employees_with_team,
        (SELECT COUNT(*) FROM team_members) as total_team_members
    `);
    console.log("\n📊 STATISTICS:");
    console.table(stats);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkData();

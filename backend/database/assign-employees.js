const mysql = require("mysql2/promise");

async function assignEmployeesToTeams() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "company_forum",
      charset: "utf8mb4",
    });

    console.log("✅ Connected to database\n");

    // Lấy danh sách employees hiện tại
    const [employees] = await connection.query(
      "SELECT id, user_id, department_id, team_id FROM employee_records"
    );

    console.log(`📊 Found ${employees.length} employees\n`);

    // Lấy danh sách departments và teams chính (không phải test data)
    const [mainDepts] = await connection.query(
      "SELECT id, name FROM departments WHERE id <= 4 OR name LIKE 'Phòng%' OR name LIKE 'Bộ Phận%' ORDER BY id"
    );

    const [mainTeams] = await connection.query(
      "SELECT id, name, department_id FROM teams WHERE id <= 3 OR name LIKE 'Team%' ORDER BY id"
    );

    console.log(`📋 Found ${mainDepts.length} main departments`);
    console.log(`📋 Found ${mainTeams.length} main teams\n`);

    // Gán ngẫu nhiên departments và teams cho employees
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const dept = mainDepts[i % mainDepts.length];
      const team =
        mainTeams.filter((t) => t.department_id === dept.id)[0] ||
        mainTeams[i % mainTeams.length];

      // Update employee_records
      await connection.query(
        "UPDATE employee_records SET department_id = ?, team_id = ? WHERE id = ?",
        [dept.id, team.id, emp.id]
      );

      // Insert into team_members
      try {
        await connection.query(
          "INSERT INTO team_members (team_id, user_id, role_in_team, joined_at) VALUES (?, ?, 'member', NOW())",
          [team.id, emp.user_id]
        );
      } catch (err) {
        // Ignore duplicate errors
        if (!err.message.includes("Duplicate")) {
          throw err;
        }
      }

      console.log(
        `✅ Assigned user ${emp.user_id} to ${dept.name} (${team.name})`
      );
    }

    // Verify results
    console.log("\n📊 VERIFICATION:");
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM employee_records WHERE department_id IS NOT NULL) as employees_with_dept,
        (SELECT COUNT(*) FROM employee_records WHERE team_id IS NOT NULL) as employees_with_team,
        (SELECT COUNT(*) FROM team_members) as total_team_members
    `);
    console.table(stats);

    console.log("\n✅ Assignment completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

assignEmployeesToTeams();

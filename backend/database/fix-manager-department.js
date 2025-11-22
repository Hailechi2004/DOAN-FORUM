const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkAndFixManagerDepartment() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "forum_database",
  });

  try {
    console.log("🔍 Checking managers without department...\n");

    // Find managers without department
    const [managers] = await connection.execute(`
      SELECT u.id, u.username, u.full_name, u.email, u.department_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('Department Manager', 'manager')
    `);

    console.log(`Found ${managers.length} manager(s):\n`);
    managers.forEach((manager) => {
      console.log(`- ID: ${manager.id}`);
      console.log(`  Username: ${manager.username}`);
      console.log(`  Full Name: ${manager.full_name}`);
      console.log(
        `  Department ID: ${manager.department_id || "❌ NOT ASSIGNED"}`
      );
      console.log(`  Role: ${manager.role_name}\n`);
    });

    // Get all departments
    const [departments] = await connection.execute(`
      SELECT id, name, code, manager_id
      FROM departments
      WHERE deleted_at IS NULL
      ORDER BY id
    `);

    console.log(`\n📋 Available departments:\n`);
    departments.forEach((dept) => {
      console.log(
        `- ID: ${dept.id}, Name: ${dept.name}, Code: ${dept.code}, Manager: ${dept.manager_id || "None"}`
      );
    });

    // Fix managers without department
    const managersWithoutDept = managers.filter((m) => !m.department_id);

    if (managersWithoutDept.length > 0) {
      console.log(
        `\n🔧 Fixing ${managersWithoutDept.length} manager(s) without department...\n`
      );

      for (let i = 0; i < managersWithoutDept.length; i++) {
        const manager = managersWithoutDept[i];
        const department = departments[i % departments.length]; // Assign to available department

        await connection.execute(
          `UPDATE users SET department_id = ? WHERE id = ?`,
          [department.id, manager.id]
        );

        await connection.execute(
          `UPDATE departments SET manager_id = ? WHERE id = ?`,
          [manager.id, department.id]
        );

        console.log(
          `✅ Assigned manager "${manager.username}" to department "${department.name}"`
        );
      }

      console.log("\n✅ All managers have been assigned to departments!");
    } else {
      console.log("\n✅ All managers already have departments assigned!");
    }

    // Show final result
    console.log("\n📊 Final Manager-Department Mapping:\n");
    const [finalManagers] = await connection.execute(`
      SELECT u.id, u.username, u.full_name, u.department_id, d.name as dept_name, d.code as dept_code
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE r.name IN ('Department Manager', 'manager')
    `);

    finalManagers.forEach((manager) => {
      console.log(`👤 ${manager.full_name} (@${manager.username})`);
      console.log(
        `   → Department: ${manager.dept_name} (${manager.dept_code})\n`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkAndFixManagerDepartment();

const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkManagerUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "forum_database",
  });

  try {
    console.log("🔍 Checking users with manager role...\n");

    // Find users with department_manager role (id=2)
    const [users] = await connection.execute(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.department_id,
        r.id as role_id,
        r.name as role_name,
        d.name as department_name,
        d.code as department_code
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role_id = 2
      ORDER BY u.id
    `);

    console.log(
      `Found ${users.length} user(s) with Department Manager role:\n`
    );

    if (users.length === 0) {
      console.log(
        "❌ No users found with department_manager role (role_id = 2)\n"
      );
      console.log(
        "Please create a manager user first or update existing user's role_id to 2"
      );
      return;
    }

    users.forEach((user) => {
      console.log(`👤 User ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role_name} (ID: ${user.role_id})`);
      console.log(
        `   Department: ${user.department_name ? `${user.department_name} (${user.department_code})` : "❌ NOT ASSIGNED"}`
      );
      console.log(`   Department ID: ${user.department_id || "NULL"}\n`);
    });

    // Show all departments
    console.log("\n📋 Available Departments:\n");
    const [departments] = await connection.execute(`
      SELECT id, name, code, manager_id, is_active
      FROM departments
      WHERE deleted_at IS NULL
      ORDER BY id
    `);

    if (departments.length === 0) {
      console.log(
        "❌ No departments found. Please create departments first.\n"
      );
      return;
    }

    departments.forEach((dept) => {
      console.log(`🏢 ID: ${dept.id} | ${dept.name} (${dept.code})`);
      console.log(`   Manager ID: ${dept.manager_id || "Not assigned"}`);
      console.log(`   Status: ${dept.is_active ? "Active" : "Inactive"}\n`);
    });

    // Fix users without department
    const usersWithoutDept = users.filter((u) => !u.department_id);

    if (usersWithoutDept.length > 0) {
      console.log(
        `\n🔧 Found ${usersWithoutDept.length} manager(s) without department.\n`
      );
      console.log("To fix, run one of these SQL commands:\n");

      usersWithoutDept.forEach((user, index) => {
        const dept = departments[index % departments.length];
        console.log(`-- Assign ${user.username} to ${dept.name}`);
        console.log(
          `UPDATE users SET department_id = ${dept.id} WHERE id = ${user.id};`
        );
        console.log(
          `UPDATE departments SET manager_id = ${user.id} WHERE id = ${dept.id};\n`
        );
      });
    } else {
      console.log("\n✅ All managers have departments assigned!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkManagerUsers();

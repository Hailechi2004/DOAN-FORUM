const mysql = require("mysql2/promise");

async function fixDeptManager() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("=== FIXING dept_manager USER ===\n");

    // Find dept_manager user
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      ["manager@company.com"]
    );

    if (users.length === 0) {
      console.log("User not found!");
      return;
    }

    const userId = users[0].id;
    console.log(`Found user: ${users[0].username} (ID: ${userId})`);

    // Update user_roles to assign department
    await connection.query(
      `
      UPDATE user_roles 
      SET department_id = 1, assigned_at = NOW()
      WHERE user_id = ? AND role_id = 2
    `,
      [userId]
    );

    console.log(
      "✅ Updated user_roles: assigned department_id = 1 (IT Department)"
    );

    // Verify
    const [verification] = await connection.query(
      `
      SELECT u.id, u.username, u.email, ur.role_id, ur.department_id, 
             r.name as role_name, d.name as department_name
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      LEFT JOIN departments d ON ur.department_id = d.id
      WHERE u.id = ?
    `,
      [userId]
    );

    console.log("\n=== VERIFICATION ===");
    console.log(verification[0]);

    console.log("\n✅ Done! Now logout and login again with:");
    console.log("Email: manager@company.com");
    console.log("Password: Manager123!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

fixDeptManager();

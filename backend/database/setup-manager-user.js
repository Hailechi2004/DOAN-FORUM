const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function setupManagerUser() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("=== CHECKING EXISTING DATA ===\n");

    // Check departments
    const [departments] = await connection.query(
      "SELECT * FROM departments LIMIT 10"
    );
    console.log("Available departments:");
    departments.forEach((dept) => {
      console.log(`- ID: ${dept.id}, Name: ${dept.name}, Code: ${dept.code}`);
    });

    // Check roles
    const [roles] = await connection.query("SELECT * FROM roles");
    console.log("\nAvailable roles:");
    roles.forEach((role) => {
      console.log(
        `- ID: ${role.id}, Name: ${role.name}, Description: ${role.description || "N/A"}`
      );
    });

    // Check existing manager users
    const [existingManagers] = await connection.query(`
      SELECT u.id, u.username, u.email, ur.role_id, ur.department_id, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE ur.role_id = 2
    `);

    console.log("\n=== EXISTING MANAGER USERS ===");
    if (existingManagers.length > 0) {
      console.log(existingManagers);
    } else {
      console.log("No manager users found.");
    }

    // Check if we have a test manager user
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      ["manager_test", "manager@test.com"]
    );

    let managerId;

    if (existingUser.length > 0) {
      console.log("\n=== UPDATING EXISTING USER ===");
      managerId = existingUser[0].id;
      console.log(
        `Found existing user: ${existingUser[0].username} (ID: ${managerId})`
      );
    } else {
      console.log("\n=== CREATING NEW MANAGER USER ===");

      // Create new user
      const hashedPassword = await bcrypt.hash("manager123", 10);

      const [userResult] = await connection.query(
        `
        INSERT INTO users (username, email, password_hash, status, created_at)
        VALUES (?, ?, ?, 'active', NOW())
      `,
        ["manager_test", "manager@test.com", hashedPassword]
      );

      managerId = userResult.insertId;
      console.log(`Created new user: manager_test (ID: ${managerId})`);

      // Create profile
      await connection.query(
        `
        INSERT INTO profiles (user_id, full_name, bio, created_at)
        VALUES (?, ?, ?, NOW())
      `,
        [managerId, "Test Manager", "Department Manager Account"]
      );

      console.log("Created profile for manager");
    }

    // Assign manager role and department (role_id=2 is department_manager, let's use first department)
    const departmentId = departments.length > 0 ? departments[0].id : 1;

    // Check if user_roles entry exists
    const [existingRole] = await connection.query(
      "SELECT * FROM user_roles WHERE user_id = ?",
      [managerId]
    );

    if (existingRole.length > 0) {
      // Update existing role
      await connection.query(
        `
        UPDATE user_roles 
        SET role_id = 2, department_id = ?, assigned_at = NOW()
        WHERE user_id = ?
      `,
        [departmentId, managerId]
      );
      console.log(
        `\n✅ Updated user_roles: manager_test is now department_manager of department ${departmentId}`
      );
    } else {
      // Insert new role
      await connection.query(
        `
        INSERT INTO user_roles (user_id, role_id, department_id, assigned_at)
        VALUES (?, 2, ?, NOW())
      `,
        [managerId, departmentId]
      );
      console.log(
        `\n✅ Created user_roles: manager_test is now department_manager of department ${departmentId}`
      );
    }

    // Verify the setup
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
      [managerId]
    );

    console.log("\n=== VERIFICATION ===");
    console.log("Manager account details:");
    console.log(verification[0]);

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Username: manager_test");
    console.log("Password: manager123");
    console.log("Role: department_manager");
    console.log(
      `Department: ${verification[0].department_name} (ID: ${departmentId})`
    );
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

setupManagerUser();

const mysql = require("mysql2/promise");

async function fixAdminRoles() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "company_forum",
    });

    console.log("✅ Connected to database\n");

    // Get admin user
    const [users] = await connection.query(
      "SELECT id FROM users WHERE email = 'admin@example.com'"
    );

    if (users.length === 0) {
      console.log("❌ Admin user not found!");
      return;
    }

    const adminUserId = users[0].id;
    console.log(`📋 Admin user ID: ${adminUserId}`);

    // Get System Admin role
    const [systemAdminRole] = await connection.query(
      "SELECT id FROM roles WHERE name = 'System Admin'"
    );

    if (systemAdminRole.length === 0) {
      console.log("❌ System Admin role not found!");
      return;
    }

    const systemAdminRoleId = systemAdminRole[0].id;
    console.log(`📋 System Admin role ID: ${systemAdminRoleId}`);

    // Clear duplicate roles first
    await connection.query("DELETE FROM user_roles WHERE user_id = ?", [
      adminUserId,
    ]);
    console.log("🗑️  Cleared existing roles");

    // Add System Admin role
    await connection.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [adminUserId, systemAdminRoleId]
    );
    console.log("✅ Added System Admin role");

    // Also add admin role for compatibility
    const [adminRole] = await connection.query(
      "SELECT id FROM roles WHERE name = 'Administrator'"
    );
    if (adminRole.length > 0) {
      await connection.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [adminUserId, adminRole[0].id]
      );
      console.log("✅ Added Administrator role");
    }

    // Verify
    console.log("\n📊 VERIFICATION:");
    const [userRoles] = await connection.query(
      `SELECT r.id, r.name, r.description 
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [adminUserId]
    );
    console.table(userRoles);

    console.log("\n✅ Admin roles fixed!");
    console.log("📧 Email: admin@example.com");
    console.log("🔑 Password: Admin123!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixAdminRoles();

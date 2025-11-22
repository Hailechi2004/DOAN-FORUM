const mysql = require("mysql2/promise");

async function checkAdminAccount() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "company_forum",
    });

    console.log("✅ Connected to database\n");

    // Check for admin user
    const [users] = await connection.query(
      "SELECT id, email, username, status, is_system_admin FROM users WHERE email LIKE '%admin%' OR username LIKE '%admin%'"
    );

    console.log("📋 ADMIN USERS:");
    console.table(users);

    if (users.length === 0) {
      console.log("\n❌ No admin users found!");
      return;
    }

    // Check roles for each admin user
    for (const user of users) {
      console.log(
        `\n🔍 Checking roles for user: ${user.email} (ID: ${user.id})`
      );

      const [userRoles] = await connection.query(
        `SELECT r.id, r.name, r.description 
         FROM roles r
         INNER JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = ?`,
        [user.id]
      );

      if (userRoles.length > 0) {
        console.log("✅ User roles:");
        console.table(userRoles);
      } else {
        console.log("❌ User has NO roles assigned!");
      }
    }

    // Check available roles
    console.log("\n📋 AVAILABLE ROLES:");
    const [allRoles] = await connection.query("SELECT * FROM roles");
    console.table(allRoles);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAdminAccount();

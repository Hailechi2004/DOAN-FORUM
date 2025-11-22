const mysql = require("mysql2/promise");

async function restoreAdmin() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("🔄 Restoring admin account...");

    // Restore user ID 1 back to admin
    await db.execute(
      `UPDATE users SET username = 'admin', email = 'admin@example.com' WHERE id = 1`
    );
    console.log("✅ Restored users table");

    // Restore profile
    await db.execute(
      `UPDATE profiles SET full_name = 'System Administrator' WHERE user_id = 1`
    );
    console.log("✅ Restored profiles table");

    // Delete employee record (admin shouldn't have this)
    await db.execute(`DELETE FROM employee_records WHERE user_id = 1`);
    console.log("✅ Removed employee record");

    // Restore admin roles (1 = admin, 4 = System Admin)
    await db.execute(`DELETE FROM user_roles WHERE user_id = 1`);
    await db.execute(
      `INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (1, 1, NOW()), (1, 4, NOW())`
    );
    console.log("✅ Restored admin roles");

    // Verify
    const [result] = await db.execute(
      `SELECT u.username, u.email, p.full_name, GROUP_CONCAT(ur.role_id) as role_ids
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = 1
       GROUP BY u.id`
    );

    console.log("\n✅ ADMIN ACCOUNT RESTORED:");
    console.log(result[0]);
    console.log("\n🔑 Login credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: Admin@123");
  } catch (error) {
    console.error("❌ Failed:", error.message);
  } finally {
    await db.end();
  }
}

restoreAdmin();

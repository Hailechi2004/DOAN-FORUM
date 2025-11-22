const db = require("./src/config/database");
const bcrypt = require("bcrypt");

async function createAdminUser() {
  try {
    console.log("🔍 Checking for admin role...");

    // Check if admin role exists
    const [roles] = await db.execute(
      "SELECT id FROM roles WHERE name = 'admin'"
    );

    let adminRoleId;
    if (roles.length === 0) {
      // Create admin role
      console.log("📝 Creating admin role...");
      const [roleResult] = await db.execute(
        "INSERT INTO roles (name, description) VALUES ('admin', 'Administrator - Full system access')"
      );
      adminRoleId = roleResult.insertId;
      console.log("✅ Admin role created with ID:", adminRoleId);
    } else {
      adminRoleId = roles[0].id;
      console.log("✅ Admin role exists with ID:", adminRoleId);
    }

    // Check if admin user already exists
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = 'admin@test.com' OR username = 'admin'"
    );

    let adminUserId;
    if (existingUsers.length > 0) {
      adminUserId = existingUsers[0].id;
      console.log("ℹ️  Admin user already exists with ID:", adminUserId);
    } else {
      // Create admin user
      console.log("📝 Creating admin user...");
      const hashedPassword = await bcrypt.hash("Admin123!", 10);

      const [userResult] = await db.execute(
        "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        ["admin@test.com", "admin", hashedPassword]
      );
      adminUserId = userResult.insertId;
      console.log("✅ Admin user created with ID:", adminUserId);

      // Create profile
      await db.execute(
        "INSERT INTO profiles (user_id, full_name) VALUES (?, ?)",
        [adminUserId, "Admin User"]
      );
      console.log("✅ Admin profile created");
    }

    // Check if user already has admin role
    const [existingRole] = await db.execute(
      "SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?",
      [adminUserId, adminRoleId]
    );

    if (existingRole.length === 0) {
      // Assign admin role
      await db.execute(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [adminUserId, adminRoleId]
      );
      console.log("✅ Admin role assigned to user");
    } else {
      console.log("ℹ️  User already has admin role");
    }

    console.log("\n🎉 Admin user setup complete!");
    console.log("📧 Email: admin@test.com");
    console.log("🔑 Password: Admin123!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

createAdminUser();

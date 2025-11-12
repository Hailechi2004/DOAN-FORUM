const db = require("./src/config/database");

async function checkAdminRole() {
  try {
    console.log("🔍 Checking admin@example.com roles...\n");

    // Get user info
    const [users] = await db.execute(
      "SELECT id, email, username FROM users WHERE email = ?",
      ["admin@example.com"]
    );

    if (users.length === 0) {
      console.log("❌ User admin@example.com not found!");
      process.exit(1);
    }

    const user = users[0];
    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}\n`);

    // Get user roles
    const [roles] = await db.execute(
      `SELECT r.id, r.name, r.description
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );

    console.log("📋 User roles:");
    if (roles.length === 0) {
      console.log("   ❌ No roles assigned!");
    } else {
      roles.forEach((role) => {
        console.log(`   ✅ ${role.name} (ID: ${role.id})`);
      });
    }

    // Check all available roles
    console.log("\n📋 All available roles in system:");
    const [allRoles] = await db.execute("SELECT id, name FROM roles");
    allRoles.forEach((role) => {
      console.log(`   - ${role.name} (ID: ${role.id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkAdminRole();

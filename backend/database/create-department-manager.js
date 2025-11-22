const db = require("../src/config/database");
const bcrypt = require("bcrypt");

async function createDepartmentManager() {
  try {
    console.log("🔍 Starting Department Manager creation...\n");

    // Get Department Manager role
    console.log("📋 Checking for Department Manager role...");
    const [roles] = await db.execute(
      "SELECT id, name FROM roles WHERE name = 'Department Manager' OR code = 'department_manager'"
    );

    if (roles.length === 0) {
      console.log("❌ Department Manager role not found!");
      console.log("Available roles:");
      const [allRoles] = await db.execute("SELECT id, code, name FROM roles");
      console.table(allRoles);
      process.exit(1);
    }

    const deptManagerRoleId = roles[0].id;
    console.log(`✅ Found role: ${roles[0].name} (ID: ${deptManagerRoleId})\n`);

    // Get a department (Marketing)
    console.log("🏢 Checking departments...");
    const [departments] = await db.execute(
      "SELECT id, name, code FROM departments WHERE code = 'MKT' OR name LIKE '%Marketing%'"
    );

    let departmentId;
    let departmentName;
    if (departments.length === 0) {
      console.log(
        "⚠️  Marketing department not found, checking all departments..."
      );
      const [allDepts] = await db.execute(
        "SELECT id, name, code FROM departments"
      );

      if (allDepts.length === 0) {
        console.log(
          "❌ No departments found! Creating Marketing department..."
        );
        const [deptResult] = await db.execute(
          "INSERT INTO departments (name, code, description) VALUES (?, ?, ?)",
          ["Marketing", "MKT", "Marketing and Communications Department"]
        );
        departmentId = deptResult.insertId;
        departmentName = "Marketing";
        console.log(`✅ Created Marketing department (ID: ${departmentId})\n`);
      } else {
        console.log("Available departments:");
        console.table(allDepts);
        departmentId = allDepts[0].id;
        departmentName = allDepts[0].name;
        console.log(
          `📌 Using first department: ${departmentName} (ID: ${departmentId})\n`
        );
      }
    } else {
      departmentId = departments[0].id;
      departmentName = departments[0].name;
      console.log(
        `✅ Found department: ${departmentName} (ID: ${departmentId})\n`
      );
    }

    // Check if manager user already exists
    const email = "manager@company.com";
    const username = "dept_manager";

    console.log("👤 Checking for existing user...");
    const [existingUsers] = await db.execute(
      "SELECT id, email FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(
        `⚠️  User already exists (ID: ${userId}): ${existingUsers[0].email}`
      );
      console.log("Updating existing user...\n");
    } else {
      // Create new user
      console.log("📝 Creating new user...");
      const hashedPassword = await bcrypt.hash("Manager123!", 10);

      const [userResult] = await db.execute(
        "INSERT INTO users (email, username, password_hash, status) VALUES (?, ?, ?, ?)",
        [email, username, hashedPassword, "active"]
      );
      userId = userResult.insertId;
      console.log(`✅ User created (ID: ${userId})\n`);
    }

    // Create/update profile
    console.log("📝 Creating/updating profile...");
    const [existingProfile] = await db.execute(
      "SELECT id FROM profiles WHERE user_id = ?",
      [userId]
    );

    const workInfo = {
      department_id: departmentId,
      department_name: departmentName,
      position: "Department Manager",
      title: "Marketing Manager",
    };

    if (existingProfile.length === 0) {
      await db.execute(
        `INSERT INTO profiles (user_id, full_name, work_info) 
         VALUES (?, ?, ?)`,
        [userId, "Marketing Manager", JSON.stringify(workInfo)]
      );
      console.log("✅ Profile created\n");
    } else {
      await db.execute(
        `UPDATE profiles SET full_name = ?, work_info = ? 
         WHERE user_id = ?`,
        ["Marketing Manager", JSON.stringify(workInfo), userId]
      );
      console.log("✅ Profile updated\n");
    }

    // Assign Department Manager role
    console.log("🔑 Assigning Department Manager role...");
    const [existingRole] = await db.execute(
      "SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?",
      [userId, deptManagerRoleId]
    );

    if (existingRole.length === 0) {
      await db.execute(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [userId, deptManagerRoleId]
      );
      console.log("✅ Role assigned\n");
    } else {
      console.log("ℹ️  User already has Department Manager role\n");
    }

    // Update department manager_id
    console.log("🏢 Setting as department manager...");
    await db.execute("UPDATE departments SET manager_id = ? WHERE id = ?", [
      userId,
      departmentId,
    ]);
    console.log("✅ Department manager set\n");

    // Verify the setup
    console.log("🔍 Verifying setup...");
    const [verification] = await db.execute(
      `SELECT 
        u.id, u.email, u.username,
        p.full_name, p.work_info,
        d.name as department_name,
        r.name as role_name
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN departments d ON d.id = ?
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = ?`,
      [departmentId, userId]
    );

    console.log("\n✅ Department Manager created successfully!\n");
    console.log("═══════════════════════════════════════════");
    console.log("📧 Email:       ", email);
    console.log("👤 Username:    ", username);
    console.log("🔑 Password:    ", "Manager123!");
    console.log("🏢 Department:  ", departmentName);
    console.log("📋 Role:        ", "Department Manager");
    console.log("═══════════════════════════════════════════\n");

    console.log("📊 User Details:");
    console.table(verification);

    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating Department Manager:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createDepartmentManager();

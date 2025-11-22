const bcrypt = require("bcrypt");
const db = require("../src/config/database");

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create roles
    console.log("Creating roles...");
    await db.execute(`
      INSERT INTO roles (code, name, description) VALUES
      ('admin', 'Administrator', 'Full system access'),
      ('manager', 'Manager', 'Department management'),
      ('user', 'User', 'Regular employee')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // Create permissions
    console.log("Creating permissions...");
    await db.execute(`
      INSERT INTO permissions (code, name, description) VALUES
      ('post.create', 'Create Post', 'Can create new posts'),
      ('post.edit', 'Edit Post', 'Can edit posts'),
      ('post.delete', 'Delete Post', 'Can delete posts'),
      ('post.pin', 'Pin Post', 'Can pin posts'),
      ('user.manage', 'Manage Users', 'Can manage user accounts'),
      ('department.manage', 'Manage Departments', 'Can manage departments')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // Assign permissions to roles
    const [roles] = await db.execute("SELECT id, code FROM roles");
    const [permissions] = await db.execute("SELECT id, code FROM permissions");

    const roleMap = {};
    roles.forEach((r) => (roleMap[r.code] = r.id));

    const permMap = {};
    permissions.forEach((p) => (permMap[p.code] = p.id));

    // Admin gets all permissions
    for (const perm of permissions) {
      await db.execute(
        "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [roleMap["admin"], perm.id]
      );
    }

    // Manager gets some permissions
    await db.execute(
      "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [roleMap["manager"], permMap["post.pin"]]
    );

    // Create departments
    console.log("Creating departments...");
    const [deptResult] = await db.execute(`
      INSERT INTO departments (name, code, description) VALUES
      ('Engineering', 'ENG', 'Software development team'),
      ('Marketing', 'MKT', 'Marketing and communications'),
      ('Human Resources', 'HR', 'People and culture'),
      ('Sales', 'SALES', 'Sales team')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    const [departments] = await db.execute("SELECT id, code FROM departments");
    const deptMap = {};
    departments.forEach((d) => (deptMap[d.code] = d.id));

    // Create users
    console.log("Creating users...");
    const password = await bcrypt.hash("Password123!", 12);

    const users = [
      {
        email: "admin@company.com",
        username: "admin",
        full_name: "System Administrator",
        role: "admin",
        dept: "ENG",
      },
      {
        email: "john.doe@company.com",
        username: "john.doe",
        full_name: "John Doe",
        role: "manager",
        dept: "ENG",
      },
      {
        email: "jane.smith@company.com",
        username: "jane.smith",
        full_name: "Jane Smith",
        role: "user",
        dept: "ENG",
      },
      {
        email: "bob.wilson@company.com",
        username: "bob.wilson",
        full_name: "Bob Wilson",
        role: "user",
        dept: "MKT",
      },
      {
        email: "alice.brown@company.com",
        username: "alice.brown",
        full_name: "Alice Brown",
        role: "user",
        dept: "HR",
      },
    ];

    for (const user of users) {
      // Create user
      const [userResult] = await db.execute(
        "INSERT IGNORE INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        [user.email, user.username, password]
      );

      if (userResult.insertId || userResult.affectedRows > 0) {
        const [existingUser] = await db.execute(
          "SELECT id FROM users WHERE email = ?",
          [user.email]
        );
        const userId = existingUser[0].id;

        // Create profile
        await db.execute(
          "INSERT IGNORE INTO profiles (user_id, full_name, phone, bio) VALUES (?, ?, ?, ?)",
          [userId, user.full_name, null, `Hi, I'm ${user.full_name}!`]
        );

        // Assign role
        await db.execute(
          "INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [userId, roleMap[user.role]]
        );

        // Create employee record
        if (user.dept) {
          await db.execute(
            "INSERT IGNORE INTO employee_records (user_id, department_id, position, status) VALUES (?, ?, ?, ?)",
            [
              userId,
              deptMap[user.dept],
              user.role === "manager" ? "Manager" : "Employee",
              "active",
            ]
          );
        }
      }
    }

    // Create post categories
    console.log("Creating post categories...");
    await db.execute(`
      INSERT INTO post_categories (code, name, description) VALUES
      ('announcement', 'Announcement', 'Company announcements'),
      ('discussion', 'Discussion', 'General discussions'),
      ('question', 'Question', 'Questions and answers'),
      ('social', 'Social', 'Social and casual posts')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // Create sample posts
    console.log("Creating sample posts...");
    const [adminUser] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      ["admin@company.com"]
    );
    const [categories] = await db.execute(
      "SELECT id, code FROM post_categories"
    );
    const categoryMap = {};
    categories.forEach((c) => (categoryMap[c.code] = c.id));

    if (adminUser.length > 0) {
      const adminId = adminUser[0].id;

      await db.execute(
        `
        INSERT INTO posts (author_id, title, content, visibility, category_id) VALUES
        (?, 'Welcome to Company Forum!', 'This is our new internal communication platform. Feel free to share ideas, ask questions, and collaborate!', 'company', ?),
        (?, 'New Project Kickoff', 'Excited to announce we are starting a new project next week. Looking forward to working with everyone!', 'company', ?),
        (?, 'Team Building Event', 'Save the date! Team building event scheduled for next month. More details coming soon.', 'company', ?)
        ON DUPLICATE KEY UPDATE title=VALUES(title)
      `,
        [
          adminId,
          categoryMap["announcement"],
          adminId,
          categoryMap["discussion"],
          adminId,
          categoryMap["social"],
        ]
      );
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("");
    console.log("Test credentials:");
    console.log("  Admin: admin@company.com / Password123!");
    console.log("  Manager: john.doe@company.com / Password123!");
    console.log("  User: jane.smith@company.com / Password123!");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();

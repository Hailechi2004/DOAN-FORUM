/**
 * MINIMAL SEED - Only essential data for testing
 * Run: node seed-minimal.js
 */

const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "company_forum",
};

async function seed() {
  let conn;

  try {
    console.log("\n🌱 Starting minimal seed...\n");

    conn = await mysql.createConnection(DB_CONFIG);

    // Hash password
    const password = await bcrypt.hash("Password123!", 10);

    // 0. Roles
    console.log("Creating roles...");
    await conn.query(
      `
      INSERT INTO roles (name, description, created_at) VALUES
      ('admin', 'Administrator', NOW()),
      ('moderator', 'Moderator', NOW()),
      ('user', 'Regular User', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `
    );
    const [roleRows] = await conn.query("SELECT id, name FROM roles");
    const roleMap = Object.fromEntries(roleRows.map((r) => [r.name, r.id]));
    console.log("✅ Roles\n");

    // 1. Users
    console.log("Creating users...");
    await conn.query(
      `
      INSERT INTO users (username, email, password_hash, created_at) VALUES
      ('admin', 'admin@example.com', ?, NOW()),
      ('user1', 'user1@example.com', ?, NOW()),
      ('user2', 'user2@example.com', ?, NOW())
      ON DUPLICATE KEY UPDATE id=id
    `,
      [password, password, password]
    );

    // Assign roles
    const [users] = await conn.query("SELECT id, username FROM users LIMIT 3");
    for (const user of users) {
      const roleName = user.username === "admin" ? "admin" : "user";
      await conn.query(
        `
        INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE user_id=user_id
      `,
        [user.id, roleMap[roleName]]
      );
    }
    console.log("✅ Users with roles\n");

    // 2. Profiles
    console.log("Creating profiles...");
    const [userList] = await conn.query("SELECT id FROM users LIMIT 3");
    for (const user of userList) {
      await conn.query(
        `
        INSERT INTO profiles (user_id, full_name, created_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE user_id=user_id
      `,
        [user.id, `User ${user.id}`]
      );
    }
    console.log("✅ Profiles\n");

    // 3. Departments
    console.log("Creating departments...");
    await conn.query(`
      INSERT INTO departments (name, description, created_at) VALUES
      ('IT', 'IT Department', NOW()),
      ('HR', 'HR Department', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log("✅ Departments\n");

    // 4. Post Categories
    console.log("Creating post categories...");
    await conn.query(`
      INSERT INTO post_categories (code, name, description) VALUES
      ('general', 'General', 'General posts'),
      ('tech', 'Tech', 'Technology posts')
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log("✅ Post categories\n");

    // 5. Posts
    console.log("Creating posts...");
    const [cats] = await conn.query("SELECT id FROM post_categories LIMIT 1");
    if (userList.length > 0 && cats.length > 0) {
      await conn.query(
        `
        INSERT INTO posts (title, content, author_id, category_id, created_at) VALUES
        ('Welcome Post', 'Welcome to our forum!', ?, ?, NOW()),
        ('Test Post', 'This is a test post.', ?, ?, NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [
          userList[0].id,
          cats[0].id,
          userList[1]?.id || userList[0].id,
          cats[0].id,
        ]
      );
    }
    console.log("✅ Posts\n");

    // 6. Comments
    console.log("Creating comments...");
    const [posts] = await conn.query("SELECT id FROM posts LIMIT 1");
    if (posts.length > 0 && userList.length > 1) {
      const commentId = await conn.query(
        `
        INSERT INTO comments (post_id, author_id, content, path, created_at) VALUES
        (?, ?, 'Great post!', '/', NOW())
        ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
      `,
        [posts[0].id, userList[1].id]
      );

      // Update path with actual ID
      if (commentId[0].insertId) {
        await conn.query(
          `
          UPDATE comments SET path = ? WHERE id = ?
        `,
          [`/${commentId[0].insertId}/`, commentId[0].insertId]
        );
      }
    }
    console.log("✅ Comments\n");

    console.log("═══════════════════════════════════════════");
    console.log("🎉 SEED COMPLETED!\n");

    // Summary
    const [stats] = await conn.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM posts) as posts,
        (SELECT COUNT(*) FROM departments) as departments,
        (SELECT COUNT(*) FROM post_categories) as categories
    `);

    console.log("📊 DATABASE:");
    console.log(`   Users:       ${stats[0].users}`);
    console.log(`   Posts:       ${stats[0].posts}`);
    console.log(`   Departments: ${stats[0].departments}`);
    console.log(`   Categories:  ${stats[0].categories}\n`);
    console.log("✅ Ready for testing!\n");
    console.log("📝 Login credentials:");
    console.log("   Email:    admin@example.com");
    console.log("   Password: Password123!\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.sql) console.error("SQL:", error.sql);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seed();

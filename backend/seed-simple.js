/**
 * SIMPLE SEED SCRIPT - Create test data for API testing
 * Run: node seed-simple.js
 */

const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "company_forum",
};

async function seedData() {
  let connection;

  try {
    console.log("🌱 Starting simple seed...\n");

    connection = await mysql.createConnection(DB_CONFIG);
    console.log("✅ Database connected\n");

    // Hash password
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // 1. Create users
    console.log("Creating users...");
    await connection.query(
      `
      INSERT INTO users (username, email, password_hash, created_at) VALUES
      ('admin', 'admin@example.com', ?, NOW()),
      ('john_doe', 'john@example.com', ?, NOW()),
      ('jane_smith', 'jane@example.com', ?, NOW()),
      ('bob_wilson', 'bob@example.com', ?, NOW()),
      ('alice_johnson', 'alice@example.com', ?, NOW())
      ON DUPLICATE KEY UPDATE id=id
    `,
      [
        hashedPassword,
        hashedPassword,
        hashedPassword,
        hashedPassword,
        hashedPassword,
      ]
    );
    console.log("✅ 5 users created\n");

    // 2. Create user profiles
    console.log("Creating user profiles...");
    const [users] = await connection.query("SELECT id FROM users LIMIT 5");
    for (const user of users) {
      await connection.query(
        `
        INSERT INTO profiles (user_id, full_name, bio, created_at)
        VALUES (?, 'Test User', 'Test user profile', NOW())
        ON DUPLICATE KEY UPDATE user_id=user_id
      `,
        [user.id]
      );
    }
    console.log("✅ User profiles created\n");

    // 3. Create roles
    console.log("Creating roles...");
    await connection.query(`
      INSERT INTO roles (name, description, created_at) VALUES
      ('admin', 'Administrator role', NOW()),
      ('manager', 'Manager role', NOW()),
      ('user', 'Regular user role', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log("✅ 3 roles created\n");

    // 4. Assign roles to users
    console.log("Assigning roles...");
    const [roleAdmin] = await connection.query(
      'SELECT id FROM roles WHERE name = "admin" LIMIT 1'
    );
    const [roleUser] = await connection.query(
      'SELECT id FROM roles WHERE name = "user" LIMIT 1'
    );

    if (roleAdmin.length > 0 && users.length > 0) {
      await connection.query(
        `
        INSERT INTO user_roles (user_id, role_id, assigned_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE user_id=user_id
      `,
        [users[0].id, roleAdmin[0].id]
      );

      for (let i = 1; i < users.length && roleUser.length > 0; i++) {
        await connection.query(
          `
          INSERT INTO user_roles (user_id, role_id, assigned_at)
          VALUES (?, ?, NOW())
          ON DUPLICATE KEY UPDATE user_id=user_id
        `,
          [users[i].id, roleUser[0].id]
        );
      }
    }
    console.log("✅ Roles assigned\n");

    // 5. Create departments
    console.log("Creating departments...");
    await connection.query(`
      INSERT INTO departments (name, description, created_at) VALUES
      ('IT Department', 'Information Technology', NOW()),
      ('HR Department', 'Human Resources', NOW()),
      ('Sales Department', 'Sales and Marketing', NOW()),
      ('Finance Department', 'Finance and Accounting', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log("✅ 4 departments created\n");

    // 6. Create teams
    console.log("Creating teams...");
    const [depts] = await connection.query(
      "SELECT id FROM departments LIMIT 2"
    );
    if (depts.length > 0) {
      await connection.query(
        `
        INSERT INTO teams (name, description, department_id, created_at) VALUES
        ('Backend Team', 'Backend development team', ?, NOW()),
        ('Frontend Team', 'Frontend development team', ?, NOW()),
        ('QA Team', 'Quality assurance team', ?, NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [depts[0].id, depts[0].id, depts.length > 1 ? depts[1].id : depts[0].id]
      );
    }
    console.log("✅ 3 teams created\n");

    // 7. Create categories
    console.log("Creating categories...");
    await connection.query(`
      INSERT INTO categories (name, description, created_at) VALUES
      ('General', 'General discussions', NOW()),
      ('Technology', 'Tech related posts', NOW()),
      ('Announcements', 'Important announcements', NOW()),
      ('Questions', 'Questions and answers', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `);
    console.log("✅ 4 categories created\n");

    // 8. Create posts
    console.log("Creating posts...");
    const [categories] = await connection.query(
      "SELECT id FROM categories LIMIT 2"
    );
    if (users.length > 0 && categories.length > 0) {
      await connection.query(
        `
        INSERT INTO posts (title, content, author_id, category_id, is_pinned, created_at) VALUES
        ('Welcome to the Company Forum', 'This is our new company forum platform. Feel free to share and discuss!', ?, ?, true, NOW()),
        ('New Project Announcement', 'We are excited to announce our new project starting next month.', ?, ?, false, NOW()),
        ('Team Building Event', 'Join us for team building activities this Friday!', ?, ?, false, NOW()),
        ('Technical Discussion: Node.js Best Practices', 'Let\'s discuss best practices for Node.js development.', ?, ?, false, NOW()),
        ('Q&A: Company Policies', 'Ask any questions about company policies here.', ?, ?, false, NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [
          users[0].id,
          categories[0].id,
          users[0].id,
          categories[0].id,
          users[1].id,
          categories[0].id,
          users[2].id,
          categories.length > 1 ? categories[1].id : categories[0].id,
          users[1].id,
          categories[0].id,
        ]
      );
    }
    console.log("✅ 5 posts created\n");

    // 9. Create comments
    console.log("Creating comments...");
    const [posts] = await connection.query("SELECT id FROM posts LIMIT 3");
    if (posts.length > 0 && users.length > 1) {
      await connection.query(
        `
        INSERT INTO comments (post_id, user_id, content, created_at) VALUES
        (?, ?, 'Great initiative! Looking forward to it.', NOW()),
        (?, ?, 'Thanks for sharing this information.', NOW()),
        (?, ?, 'Count me in for the event!', NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [
          posts[0].id,
          users[1].id,
          posts[1].id,
          users[2].id,
          posts.length > 2 ? posts[2].id : posts[0].id,
          users[3]?.id || users[1].id,
        ]
      );
    }
    console.log("✅ Comments created\n");

    // 10. Create projects
    console.log("Creating projects...");
    if (depts.length > 0 && users.length > 0) {
      await connection.query(
        `
        INSERT INTO projects (name, description, department_id, manager_id, status, start_date, created_at) VALUES
        ('Website Redesign', 'Complete redesign of company website', ?, ?, 'in_progress', NOW(), NOW()),
        ('Mobile App Development', 'Develop mobile app for iOS and Android', ?, ?, 'planning', NOW(), NOW()),
        ('Database Migration', 'Migrate to new database system', ?, ?, 'in_progress', NOW(), NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [
          depts[0].id,
          users[0].id,
          depts[0].id,
          users[1].id,
          depts[0].id,
          users[0].id,
        ]
      );
    }
    console.log("✅ 3 projects created\n");

    // 11. Create tasks
    console.log("Creating tasks...");
    const [projects] = await connection.query(
      "SELECT id FROM projects LIMIT 2"
    );
    if (projects.length > 0 && users.length > 1) {
      await connection.query(
        `
        INSERT INTO tasks (title, description, project_id, assigned_to, created_by, priority, status, due_date, created_at) VALUES
        ('Setup development environment', 'Configure all dev tools and dependencies', ?, ?, ?, 'high', 'completed', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW()),
        ('Design database schema', 'Create ERD and design database tables', ?, ?, ?, 'high', 'in_progress', DATE_ADD(NOW(), INTERVAL 14 DAY), NOW()),
        ('Implement authentication', 'Develop login and registration system', ?, ?, ?, 'urgent', 'pending', DATE_ADD(NOW(), INTERVAL 10 DAY), NOW()),
        ('Write API documentation', 'Document all API endpoints', ?, ?, ?, 'medium', 'pending', DATE_ADD(NOW(), INTERVAL 21 DAY), NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [
          projects[0].id,
          users[1].id,
          users[0].id,
          projects[0].id,
          users[2].id,
          users[0].id,
          projects[0].id,
          users[1].id,
          users[0].id,
          projects.length > 1 ? projects[1].id : projects[0].id,
          users[3]?.id || users[1].id,
          users[0].id,
        ]
      );
    }
    console.log("✅ 4 tasks created\n");

    // 12. Create events
    console.log("Creating events...");
    if (users.length > 0) {
      await connection.query(
        `
        INSERT INTO events (title, description, location, start_time, end_time, created_by, created_at) VALUES
        ('Weekly Team Sync', 'Weekly team synchronization meeting', 'Conference Room A', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), ?, NOW()),
        ('Company All-Hands', 'Quarterly company meeting', 'Main Auditorium', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), ?, NOW()),
        ('Tech Talk: AI & ML', 'Discussion on AI and Machine Learning', 'Virtual', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), ?, NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [users[0].id, users[0].id, users[1].id]
      );
    }
    console.log("✅ 3 events created\n");

    // 13. Create meetings
    console.log("Creating meetings...");
    if (users.length > 0) {
      await connection.query(
        `
        INSERT INTO meetings (title, description, scheduled_time, duration_minutes, location, created_by, created_at) VALUES
        ('Sprint Planning', 'Plan tasks for next sprint', DATE_ADD(NOW(), INTERVAL 1 DAY), 60, 'Meeting Room 1', ?, NOW()),
        ('Code Review Session', 'Review recent code changes', DATE_ADD(NOW(), INTERVAL 3 DAY), 90, 'Conference Room B', ?, NOW())
        ON DUPLICATE KEY UPDATE id=id
      `,
        [users[0].id, users[1].id]
      );
    }
    console.log("✅ 2 meetings created\n");

    // 14. Create polls
    console.log("Creating polls...");
    if (users.length > 0) {
      const [pollResult] = await connection.query(
        `
        INSERT INTO polls (question, created_by, allow_multiple, created_at) VALUES
        ('What is your preferred programming language?', ?, false, NOW()),
        ('Best time for team meetings?', ?, false, NOW())
        ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
      `,
        [users[0].id, users[1].id]
      );

      if (pollResult.insertId) {
        await connection.query(
          `
          INSERT INTO poll_options (poll_id, option_text, option_order) VALUES
          (?, 'JavaScript', 1),
          (?, 'Python', 2),
          (?, 'Java', 3),
          (?, 'C#', 4)
          ON DUPLICATE KEY UPDATE poll_id=poll_id
        `,
          [
            pollResult.insertId,
            pollResult.insertId,
            pollResult.insertId,
            pollResult.insertId,
          ]
        );
      }
    }
    console.log("✅ Polls created\n");

    console.log("═══════════════════════════════════════════════════");
    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════\n");

    // Print summary
    const [userCount] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    const [postCount] = await connection.query(
      "SELECT COUNT(*) as count FROM posts"
    );
    const [projectCount] = await connection.query(
      "SELECT COUNT(*) as count FROM projects"
    );
    const [taskCount] = await connection.query(
      "SELECT COUNT(*) as count FROM tasks"
    );
    const [eventCount] = await connection.query(
      "SELECT COUNT(*) as count FROM events"
    );

    console.log("📊 DATABASE SUMMARY:");
    console.log(`   Users:       ${userCount[0].count}`);
    console.log(`   Posts:       ${postCount[0].count}`);
    console.log(`   Projects:    ${projectCount[0].count}`);
    console.log(`   Tasks:       ${taskCount[0].count}`);
    console.log(`   Events:      ${eventCount[0].count}`);
    console.log("\n✅ Database is ready for testing!\n");
    console.log("📝 Test credentials:");
    console.log("   Email:    admin@example.com");
    console.log("   Password: Password123!\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error.message);
    if (error.sql) {
      console.error("SQL:", error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedData();

const mysql = require("mysql2/promise");

async function seedTaskWorkflow() {
  let connection;

  try {
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "company_forum",
    };

    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database!");

    // Get existing data
    console.log("\n🔍 Checking existing data...");
    const [projects] = await connection.query(
      "SELECT id, name FROM projects LIMIT 1"
    );
    const [departments] = await connection.query(
      "SELECT pd.id, pd.project_id, pd.department_id, d.name as dept_name FROM project_departments pd JOIN departments d ON pd.department_id = d.id WHERE pd.project_id = ? LIMIT 3",
      [projects[0].id]
    );
    const [users] = await connection.query(
      "SELECT u.id, u.username, p.full_name FROM users u LEFT JOIN profiles p ON u.profile_id = p.id LIMIT 5"
    );

    if (projects.length === 0) {
      console.error("❌ No projects found! Please create a project first.");
      process.exit(1);
    }

    const projectId = projects[0].id;
    console.log(`📁 Using project: ${projects[0].name} (ID: ${projectId})`);

    if (departments.length === 0) {
      console.error("❌ No departments assigned to this project!");
      process.exit(1);
    }

    console.log(`🏢 Found ${departments.length} departments`);
    console.log(`👥 Found ${users.length} users`);

    // Clear existing workflow data for this project
    console.log("\n🗑️ Clearing existing workflow data...");
    await connection.query(
      "DELETE FROM project_task_reports WHERE project_id = ?",
      [projectId]
    );
    await connection.query(
      "DELETE FROM project_warnings WHERE project_id = ?",
      [projectId]
    );
    await connection.query(
      "DELETE mt FROM project_member_tasks mt INNER JOIN project_department_tasks dt ON mt.department_task_id = dt.id WHERE dt.project_id = ?",
      [projectId]
    );
    await connection.query(
      "DELETE FROM project_department_tasks WHERE project_id = ?",
      [projectId]
    );

    // Seed Department Tasks
    console.log("\n📝 Seeding Department Tasks...");
    const deptTasks = [];

    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      const taskStatuses = ["assigned", "in_progress", "submitted", "approved"];
      const status = taskStatuses[i % taskStatuses.length];

      const [result] = await connection.query(
        `INSERT INTO project_department_tasks 
        (project_id, department_id, title, description, priority, estimated_hours, status, deadline, assigned_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?)`,
        [
          projectId,
          dept.department_id,
          `${dept.dept_name} Task ${i + 1}`,
          `This is a sample task for ${dept.dept_name} department`,
          ["low", "medium", "high", "urgent"][i % 4],
          40 + i * 8,
          status,
          7 + i * 3,
          users[0]?.id || 1,
        ]
      );

      deptTasks.push({
        id: result.insertId,
        department_id: dept.department_id,
        status: status,
      });

      console.log(`  ✓ Created ${status} task for ${dept.dept_name}`);
    }

    // Seed Member Tasks (only for in_progress/submitted/approved department tasks)
    console.log("\n👤 Seeding Member Tasks...");
    let memberTaskCount = 0;

    for (const deptTask of deptTasks) {
      if (["in_progress", "submitted", "approved"].includes(deptTask.status)) {
        const assignedUsers = users.slice(0, 2); // Assign to 2 users

        for (let i = 0; i < assignedUsers.length; i++) {
          const user = assignedUsers[i];
          const memberStatuses = [
            "assigned",
            "in_progress",
            "submitted",
            "approved",
          ];
          const status = memberStatuses[i % memberStatuses.length];

          await connection.query(
            `INSERT INTO project_member_tasks 
            (department_task_id, user_id, title, description, priority, estimated_hours, status, deadline, progress, assigned_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?)`,
            [
              deptTask.id,
              user.id,
              `Member Task for ${user.full_name || user.username}`,
              `Individual task assigned to ${user.full_name || user.username}`,
              ["medium", "high"][i % 2],
              16 + i * 4,
              status,
              5 + i * 2,
              status === "completed" ? 100 : status === "in_progress" ? 50 : 0,
              users[0]?.id || 1,
            ]
          );

          memberTaskCount++;
        }
      }
    }

    console.log(`  ✓ Created ${memberTaskCount} member tasks`);

    // Seed Reports
    console.log("\n📊 Seeding Task Reports...");
    const reportTypes = ["daily", "weekly", "monthly", "completion", "issue"];

    for (let i = 0; i < 5; i++) {
      await connection.query(
        `INSERT INTO project_task_reports 
        (project_id, reported_by, report_type, title, content)
        VALUES (?, ?, ?, ?, ?)`,
        [
          projectId,
          users[i % users.length]?.id || 1,
          reportTypes[i],
          `${reportTypes[i].charAt(0).toUpperCase() + reportTypes[i].slice(1)} Report ${i + 1}`,
          `This is a sample ${reportTypes[i]} report with detailed information about project progress and issues.`,
        ]
      );
    }

    console.log(`  ✓ Created 5 reports`);

    // Seed Warnings
    console.log("\n⚠️ Seeding Project Warnings...");
    const severities = ["low", "medium", "high", "critical"];
    const warningTypes = [
      "late_submission",
      "poor_quality",
      "missed_deadline",
      "incomplete_work",
    ];

    for (let i = 0; i < 4; i++) {
      const isAcknowledged = i % 2 === 0;

      await connection.query(
        `INSERT INTO project_warnings 
        (project_id, warned_user_id, issued_by, warning_type, severity, reason, acknowledged_at, acknowledged_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          users[i % users.length]?.id || 2,
          users[0]?.id || 1,
          warningTypes[i],
          severities[i],
          `This is a ${severities[i]} severity warning regarding ${warningTypes[i].replace("_", " ")}. Please improve your work quality.`,
          isAcknowledged ? new Date() : null,
          isAcknowledged ? users[i % users.length]?.id : null,
        ]
      );
    }

    console.log(`  ✓ Created 4 warnings`);

    // Verify seeded data
    console.log("\n📈 Verification:");
    const [deptCount] = await connection.query(
      "SELECT COUNT(*) as count FROM project_department_tasks WHERE project_id = ?",
      [projectId]
    );
    const [memberCount] = await connection.query(
      "SELECT COUNT(*) as count FROM project_member_tasks mt INNER JOIN project_department_tasks dt ON mt.department_task_id = dt.id WHERE dt.project_id = ?",
      [projectId]
    );
    const [reportCount] = await connection.query(
      "SELECT COUNT(*) as count FROM project_task_reports WHERE project_id = ?",
      [projectId]
    );
    const [warningCount] = await connection.query(
      "SELECT COUNT(*) as count FROM project_warnings WHERE project_id = ?",
      [projectId]
    );

    console.log(`  Department Tasks: ${deptCount[0].count}`);
    console.log(`  Member Tasks: ${memberCount[0].count}`);
    console.log(`  Reports: ${reportCount[0].count}`);
    console.log(`  Warnings: ${warningCount[0].count}`);

    console.log("\n🎉 Task workflow seeding completed successfully!");
    console.log(`\n💡 You can now view this data in project ID: ${projectId}`);
  } catch (error) {
    console.error("\n❌ Seeding failed:");
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

seedTaskWorkflow();

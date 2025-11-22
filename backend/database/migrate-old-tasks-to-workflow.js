const mysql = require("mysql2/promise");

async function migrateOldTasks() {
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
    console.log("✅ Connected!\n");

    // Step 1: Analyze old tasks
    console.log("📊 STEP 1: Analyzing old tasks system...");
    const [oldTasks] = await connection.query(`
      SELECT 
        t.*,
        p.name as project_name,
        p.department_id,
        d.name as dept_name
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN departments d ON p.department_id = d.id
      ORDER BY t.project_id, t.id
    `);

    console.log(`Found ${oldTasks.length} old tasks\n`);

    if (oldTasks.length === 0) {
      console.log("✅ No old tasks to migrate. You're good!");
      return;
    }

    // Show sample
    console.log("Sample old tasks:");
    oldTasks.slice(0, 3).forEach((task) => {
      console.log(
        `  - ${task.title} (Project: ${task.project_name}, Status: ${task.status})`
      );
    });
    console.log("");

    // Step 2: Check new system
    console.log("📊 STEP 2: Checking new workflow system...");
    const [deptTasks] = await connection.query(
      "SELECT COUNT(*) as count FROM project_department_tasks"
    );
    const [memberTasks] = await connection.query(
      "SELECT COUNT(*) as count FROM project_member_tasks"
    );
    const [reports] = await connection.query(
      "SELECT COUNT(*) as count FROM project_task_reports"
    );
    const [warnings] = await connection.query(
      "SELECT COUNT(*) as count FROM project_warnings"
    );

    console.log(`Current workflow data:`);
    console.log(`  - Department Tasks: ${deptTasks[0].count}`);
    console.log(`  - Member Tasks: ${memberTasks[0].count}`);
    console.log(`  - Reports: ${reports[0].count}`);
    console.log(`  - Warnings: ${warnings[0].count}\n`);

    // Step 3: Migration strategy decision
    console.log("🤔 STEP 3: Migration Strategy Analysis\n");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("OPTION 1: Keep Both Systems (Recommended for Testing)");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Pros:");
    console.log("  - Old data preserved");
    console.log("  - No breaking changes to existing features");
    console.log("  - Can test new workflow alongside old system");
    console.log("  - Easy rollback if issues occur");
    console.log("❌ Cons:");
    console.log("  - Database has duplicate/redundant tables");
    console.log("  - Need to maintain 2 APIs temporarily");
    console.log("  - May confuse users seeing 2 task tabs\n");

    console.log("═══════════════════════════════════════════════════════════");
    console.log("OPTION 2: Migrate Old → New (Production Ready)");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Pros:");
    console.log("  - Clean database structure");
    console.log("  - Single source of truth");
    console.log("  - Better long-term maintainability");
    console.log("❌ Cons:");
    console.log("  - Requires mapping old status → new workflow");
    console.log("  - Need to assign departments to tasks");
    console.log("  - May lose some old task metadata");
    console.log("  - Cannot easily rollback\n");

    console.log("═══════════════════════════════════════════════════════════");
    console.log("OPTION 3: Archive Old + Start Fresh (Cleanest)");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Pros:");
    console.log("  - Cleanest database state");
    console.log("  - No migration complexity");
    console.log("  - Old data backed up for reference");
    console.log("❌ Cons:");
    console.log("  - Old tasks not accessible in new UI");
    console.log("  - Historical data separated\n");

    // Step 4: Recommendations
    console.log("💡 STEP 4: Recommendations\n");
    console.log("Based on your current state:");
    console.log(
      `  - Old tasks: ${oldTasks.length} tasks across ${new Set(oldTasks.map((t) => t.project_id)).size} projects`
    );
    console.log(
      `  - New workflow: ${deptTasks[0].count + memberTasks[0].count} tasks\n`
    );

    if (oldTasks.length <= 10 && deptTasks[0].count > 0) {
      console.log("🎯 RECOMMENDED: OPTION 3 (Archive Old + Start Fresh)");
      console.log("Reason: Few old tasks, new system already has data");
      console.log("\nNext steps:");
      console.log("  1. Rename project_tasks → project_tasks_archive");
      console.log("  2. Update frontend to use only new workflow tabs");
      console.log("  3. Keep archive for 30 days then drop");
    } else if (oldTasks.length > 50) {
      console.log("🎯 RECOMMENDED: OPTION 2 (Migrate Old → New)");
      console.log("Reason: Significant old data worth preserving");
      console.log("\nNext steps:");
      console.log("  1. Run migration to convert old tasks → department tasks");
      console.log("  2. Assign departments based on project.department_id");
      console.log("  3. Map old status to new workflow stages");
      console.log("  4. Verify migration success");
      console.log("  5. Rename project_tasks → project_tasks_old");
    } else {
      console.log("🎯 RECOMMENDED: OPTION 1 (Keep Both - Testing Phase)");
      console.log("Reason: Moderate data, still in development");
      console.log("\nNext steps:");
      console.log("  1. Keep both systems running in parallel");
      console.log("  2. Test new workflow thoroughly");
      console.log("  3. Once stable, decide on Option 2 or 3");
      console.log("  4. Hide old Tasks tab in frontend temporarily");
    }

    console.log(
      "\n═══════════════════════════════════════════════════════════"
    );
    console.log("🔧 Implementation Scripts Available:");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("Run one of these commands based on your choice:\n");
    console.log("  node database/archive-old-tasks.js     # Option 3");
    console.log("  node database/migrate-tasks-to-workflow.js  # Option 2");
    console.log("  # Option 1 - no action needed, already working\n");
  } catch (error) {
    console.error("\n❌ Analysis failed:");
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

migrateOldTasks();

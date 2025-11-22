const db = require("../src/config/database");

async function createOverdueTasks() {
  try {
    console.log("🧪 Creating overdue tasks for testing...\n");

    const projectId = 1;
    const departmentId = 1;

    // Create 2 overdue department tasks
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    await db.query(
      `INSERT INTO project_department_tasks (project_id, department_id, title, description, deadline, status, assigned_by, created_at)
       VALUES 
       (?, ?, 'Overdue Dept Task 1', 'This task is 1 day overdue', ?, 'in_progress', 1, NOW()),
       (?, ?, 'Overdue Dept Task 2', 'This task is 7 days overdue', ?, 'assigned', 1, NOW())`,
      [
        projectId,
        departmentId,
        yesterday.toISOString().slice(0, 19).replace("T", " "),
        projectId,
        departmentId,
        lastWeek.toISOString().slice(0, 19).replace("T", " "),
      ]
    );

    console.log("✅ Created 2 overdue department tasks\n");

    // Create 2 overdue member tasks
    const [deptTasks] = await db.query(
      `SELECT id FROM project_department_tasks WHERE project_id = ? LIMIT 1`,
      [projectId]
    );
    const deptTaskId = deptTasks[0]?.id;

    if (deptTaskId) {
      await db.query(
        `INSERT INTO project_member_tasks (department_task_id, user_id, title, description, deadline, status, assigned_by, created_at)
         VALUES 
         (?, 2, 'Member Overdue Task 1', 'Member task 1 day overdue', ?, 'in_progress', 1, NOW()),
         (?, 3, 'Member Overdue Task 2', 'Member task 7 days overdue', ?, 'assigned', 1, NOW())`,
        [
          deptTaskId,
          yesterday.toISOString().slice(0, 19).replace("T", " "),
          deptTaskId,
          lastWeek.toISOString().slice(0, 19).replace("T", " "),
        ]
      );
      console.log("✅ Created 2 overdue member tasks\n");
    } else {
      console.log("⚠️ No department task found, skipping member tasks\n");
    }

    console.log("📊 Summary:");
    console.log("  - Project ID:", projectId);
    console.log("  - Department ID:", departmentId);
    console.log("  - Yesterday:", yesterday.toLocaleString());
    console.log("  - Last week:", lastWeek.toLocaleString());
    console.log("\n✅ Done! Reload the Warnings tab to see suggestions.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createOverdueTasks();

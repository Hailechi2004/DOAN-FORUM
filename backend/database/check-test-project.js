const mysql = require("mysql2/promise");

async function checkTestProject() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  const [projects] = await conn.query(
    "SELECT id, name FROM projects WHERE id = 1"
  );

  if (projects.length === 0) {
    console.log("❌ Project ID 1 not found!");
    await conn.end();
    return;
  }

  console.log("\n🎯 PROJECT TO TEST:");
  console.log("═══════════════════════════════════════");
  console.log(`  📌 ID: ${projects[0].id}`);
  console.log(`  📁 Name: ${projects[0].name}`);

  const [deptTasks] = await conn.query(
    "SELECT COUNT(*) as count FROM project_department_tasks WHERE project_id = 1"
  );
  const [memberTasks] = await conn.query(
    "SELECT COUNT(*) as count FROM project_member_tasks mt INNER JOIN project_department_tasks dt ON mt.department_task_id = dt.id WHERE dt.project_id = 1"
  );
  const [reports] = await conn.query(
    "SELECT COUNT(*) as count FROM project_task_reports WHERE project_id = 1"
  );
  const [warnings] = await conn.query(
    "SELECT COUNT(*) as count FROM project_warnings WHERE project_id = 1"
  );
  const [departments] = await conn.query(
    "SELECT COUNT(*) as count FROM project_departments WHERE project_id = 1"
  );

  console.log("\n📊 WORKFLOW DATA AVAILABLE:");
  console.log("═══════════════════════════════════════");
  console.log(`  🏢 Departments: ${departments[0].count}`);
  console.log(`  📋 Department Tasks: ${deptTasks[0].count}`);
  console.log(`  👤 Member Tasks: ${memberTasks[0].count}`);
  console.log(`  📊 Reports: ${reports[0].count}`);
  console.log(`  ⚠️  Warnings: ${warnings[0].count}`);

  console.log("\n✅ READY TO TEST!");
  console.log("═══════════════════════════════════════");
  console.log("🔗 URL: http://localhost:5173/admin/projects/1");
  console.log("\n💡 Tabs to test:");
  console.log("  • Công Việc Phòng Ban (Department Tasks)");
  console.log("  • Công Việc Nhân Viên (Member Tasks)");
  console.log("  • Báo Cáo (Reports)");
  console.log("  • Cảnh Báo (Warnings)");
  console.log("");

  await conn.end();
}

checkTestProject().catch(console.error);

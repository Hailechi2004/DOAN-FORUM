const ProjectDepartment = require("../src/models/ProjectDepartment");
const db = require("../src/config/database");

async function test() {
  try {
    console.log("🧪 Testing assignDepartments...\n");

    const projectId = 1;
    const departmentIds = [1, 2];

    // Delete existing
    await db.query("DELETE FROM project_departments WHERE project_id = ?", [
      projectId,
    ]);
    console.log("✅ Deleted old records\n");

    // Insert new
    await ProjectDepartment.assignDepartments(projectId, departmentIds, 1);
    console.log("✅ Inserted new records\n");

    // Check result
    const result = await ProjectDepartment.getProjectDepartments(projectId);
    console.log("📊 Result:");
    result.forEach((row) => {
      console.log(
        `  - Dept ${row.department_id}: assigned_at = ${row.assigned_at}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

test();

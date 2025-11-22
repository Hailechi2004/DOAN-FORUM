const db = require("./src/config/database");

async function debugQuery() {
  try {
    const department_id = 1;

    // Test 1: Check what's in project_departments for dept 1
    console.log("=== TEST 1: project_departments with department_id=1 ===");
    const [pd] = await db.query(
      "SELECT pd.*, p.name FROM project_departments pd JOIN projects p ON pd.project_id = p.id WHERE pd.department_id = ?",
      [department_id]
    );
    console.log("Found", pd.length, "assignments:");
    pd.forEach((row) =>
      console.log(`  - Project ${row.project_id}: ${row.name}`)
    );

    // Test 2: Run the actual query from Project.getAll
    console.log("\n=== TEST 2: Actual query from Project.getAll ===");
    let query = `
      SELECT 
        p.id,
        p.name,
        p.department_id as direct_dept_id,
        pd.department_id as junction_dept_id,
        prof.full_name as manager_name,
        d.name as department_name
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN project_departments pd ON p.id = pd.project_id
      WHERE p.is_deleted = FALSE
        AND (p.department_id = ? OR pd.department_id = ?)
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const [rows] = await db.query(query, [department_id, department_id]);
    console.log("Query returned", rows.length, "projects:");
    rows.forEach((row) => {
      console.log(`  - [${row.id}] ${row.name}`);
      console.log(
        `    Direct dept: ${row.direct_dept_id}, Junction dept: ${row.junction_dept_id}`
      );
    });

    // Test 3: Check if GROUP BY is causing issues
    console.log("\n=== TEST 3: Query WITHOUT GROUP BY ===");
    let query2 = `
      SELECT 
        p.id,
        p.name,
        p.department_id as direct_dept_id,
        pd.department_id as junction_dept_id
      FROM projects p
      LEFT JOIN project_departments pd ON p.id = pd.project_id
      WHERE p.is_deleted = FALSE
        AND (p.department_id = ? OR pd.department_id = ?)
      ORDER BY p.created_at DESC
    `;

    const [rows2] = await db.query(query2, [department_id, department_id]);
    console.log("Query returned", rows2.length, "rows (with duplicates):");
    rows2.forEach((row) => {
      console.log(
        `  - [${row.id}] ${row.name} | Direct: ${row.direct_dept_id}, Junction: ${row.junction_dept_id}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debugQuery();

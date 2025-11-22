const db = require("../src/config/database");

async function checkTable() {
  try {
    console.log("📋 Checking project_departments table structure...\n");

    // Check table schema
    const [columns] = await db.query("DESCRIBE project_departments");
    console.log("Columns:");
    columns.forEach((col) => {
      console.log(
        `  - ${col.Field}: ${col.Type} ${col.Null === "YES" ? "(nullable)" : "(required)"} ${col.Default ? `DEFAULT ${col.Default}` : ""}`
      );
    });

    console.log("\n📊 Sample data:");
    const [rows] = await db.query(
      "SELECT * FROM project_departments ORDER BY id DESC LIMIT 3"
    );
    console.log(JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkTable();

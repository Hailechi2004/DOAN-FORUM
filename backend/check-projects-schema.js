const db = require("./src/config/database");

async function checkProjectsSchema() {
  try {
    console.log("🔍 Checking projects table schema...\n");

    // Get table structure
    const [columns] = await db.execute("SHOW COLUMNS FROM projects");

    console.log("📋 Projects Table Columns:");
    columns.forEach((col) => {
      console.log(
        `   - ${col.Field}: ${col.Type} ${col.Null === "NO" ? "NOT NULL" : "NULL"} ${col.Default ? `DEFAULT ${col.Default}` : ""}`
      );
    });

    // Check status enum values
    const statusColumn = columns.find((col) => col.Field === "status");
    if (statusColumn) {
      console.log(`\n✅ Status column type: ${statusColumn.Type}`);

      // Extract enum values
      const match = statusColumn.Type.match(/enum\((.*)\)/);
      if (match) {
        const enumValues = match[1].split(",").map((v) => v.replace(/'/g, ""));
        console.log("✅ Allowed status values:", enumValues);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkProjectsSchema();

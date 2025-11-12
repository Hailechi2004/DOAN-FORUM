const mysql = require("mysql2/promise");

async function checkSchema() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("📋 PROFILES TABLE:");
    const [profileCols] = await db.query("DESCRIBE profiles");
    profileCols.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));

    console.log("\n📋 USERS TABLE:");
    const [userCols] = await db.query("DESCRIBE users");
    userCols.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));

    console.log("\n📋 USER_ROLES TABLE:");
    const [roleCols] = await db.query("DESCRIBE user_roles");
    roleCols.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));

    // Check if employee_records exists
    const [tables] = await db.query("SHOW TABLES LIKE 'employee_records'");
    if (tables.length > 0) {
      console.log("\n📋 EMPLOYEE_RECORDS TABLE:");
      const [empCols] = await db.query("DESCRIBE employee_records");
      empCols.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));
    } else {
      console.log("\n❌ No employee_records table found");
    }
  } finally {
    await db.end();
  }
}

checkSchema().catch(console.error);

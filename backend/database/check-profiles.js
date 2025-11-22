const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkProfilesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "forum_database",
  });

  try {
    console.log("📋 Profiles table structure:\n");
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM profiles
    `);

    columns.forEach((col) => {
      console.log(
        `- ${col.Field} (${col.Type}) ${col.Null === "NO" ? "NOT NULL" : "NULL"} ${col.Key ? `[${col.Key}]` : ""}`
      );
    });

    console.log("\n\n📋 Sample profiles with user info:\n");
    const [profiles] = await connection.execute(`
      SELECT 
        p.*,
        u.username,
        u.email,
        d.name as department_name,
        d.code as department_code,
        r.name as role_name
      FROM profiles p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN roles r ON p.role_id = r.id
      LIMIT 5
    `);

    console.log(profiles);

    console.log("\n\n🔍 Looking for manager profiles...\n");
    const [managers] = await connection.execute(`
      SELECT 
        p.user_id,
        p.department_id,
        p.role_id,
        u.username,
        u.email,
        d.name as department_name,
        r.name as role_name
      FROM profiles p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN roles r ON p.role_id = r.id
      WHERE p.role_id = 2
    `);

    if (managers.length > 0) {
      console.log(`Found ${managers.length} manager(s):\n`);
      managers.forEach((m) => {
        console.log(`👤 Username: ${m.username}`);
        console.log(`   Role: ${m.role_name}`);
        console.log(`   Department: ${m.department_name || "❌ NOT ASSIGNED"}`);
        console.log(`   Department ID: ${m.department_id || "NULL"}\n`);
      });
    } else {
      console.log("❌ No managers found (role_id = 2)");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkProfilesTable();

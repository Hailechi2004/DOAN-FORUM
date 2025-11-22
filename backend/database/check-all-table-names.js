const mysql = require("mysql2/promise");

async function checkAllTables() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("=== ALL TABLES IN DATABASE ===\n");

    const [tables] = await connection.query("SHOW TABLES");
    console.log(`Found ${tables.length} tables:\n`);

    const tableKey = Object.keys(tables[0])[0]; // Get the actual key name

    tables.forEach((table, index) => {
      const tableName = table[tableKey];
      console.log(`${index + 1}. ${tableName}`);
    });

    // Check specifically for role/department related tables
    console.log("\n=== CHECKING FOR ROLE/DEPARTMENT TABLES ===\n");

    const roleRelatedTables = tables.filter((table) => {
      const tableName = table[tableKey].toLowerCase();
      return (
        tableName.includes("role") ||
        tableName.includes("department") ||
        tableName.includes("member") ||
        tableName.includes("user_")
      );
    });

    console.log("Role/Department related tables:");
    roleRelatedTables.forEach((table) => {
      console.log(`- ${table[tableKey]}`);
    });

    // Check for user_roles table specifically
    const tableNames = tables.map((t) => t[tableKey].toLowerCase());

    if (tableNames.includes("user_roles")) {
      console.log("\n=== USER_ROLES TABLE FOUND ===\n");
      const [columns] = await connection.query("SHOW COLUMNS FROM user_roles");
      console.log("Columns:");
      columns.forEach((col) => {
        console.log(`- ${col.Field} (${col.Type})`);
      });

      const [data] = await connection.query(
        "SELECT * FROM user_roles LIMIT 10"
      );
      console.log(`\nSample data (${data.length} rows):`);
      console.log(data);
    }

    if (tableNames.includes("department_members")) {
      console.log("\n=== DEPARTMENT_MEMBERS TABLE FOUND ===\n");
      const [columns] = await connection.query(
        "SHOW COLUMNS FROM department_members"
      );
      console.log("Columns:");
      columns.forEach((col) => {
        console.log(`- ${col.Field} (${col.Type})`);
      });

      const [data] = await connection.query(
        "SELECT * FROM department_members LIMIT 10"
      );
      console.log(`\nSample data (${data.length} rows):`);
      console.log(data);
    }

    if (tableNames.includes("user_departments")) {
      console.log("\n=== USER_DEPARTMENTS TABLE FOUND ===\n");
      const [columns] = await connection.query(
        "SHOW COLUMNS FROM user_departments"
      );
      console.log("Columns:");
      columns.forEach((col) => {
        console.log(`- ${col.Field} (${col.Type})`);
      });

      const [data] = await connection.query(
        "SELECT * FROM user_departments LIMIT 10"
      );
      console.log(`\nSample data (${data.length} rows):`);
      console.log(data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkAllTables();

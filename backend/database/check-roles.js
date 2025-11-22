require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkRoles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "company_forum",
    charset: "utf8mb4",
  });

  try {
    console.log("=== CHECKING ROLES & USER ASSIGNMENTS ===\n");

    // Check all roles
    const [roles] = await connection.query("SELECT * FROM roles");
    console.log("Available Roles:");
    roles.forEach((r) =>
      console.log(`  ID: ${r.id}, Code: ${r.code}, Name: ${r.name}`)
    );

    // Check test user
    const [users] = await connection.query(`
      SELECT u.id, u.email, u.username, r.name as role_name, r.code as role_code
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email LIKE '%test%' OR u.username LIKE '%test%'
      LIMIT 5
    `);

    console.log("\nTest Users:");
    users.forEach((u) => {
      console.log(
        `  ${u.email} (${u.username}) -> Role: ${u.role_name} (${u.role_code})`
      );
    });

    // Check jane.smith
    const [jane] = await connection.query(`
      SELECT u.id, u.email, u.username, r.name as role_name, r.code as role_code
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = 'jane.smith@company.com'
    `);

    console.log("\nJane Smith:");
    if (jane.length > 0) {
      jane.forEach((u) => {
        console.log(`  ${u.email} -> Role: ${u.role_name} (${u.role_code})`);
      });
    } else {
      console.log("  Not found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkRoles();

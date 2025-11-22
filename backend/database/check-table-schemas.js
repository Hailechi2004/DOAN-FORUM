require("dotenv").config();
const mysql = require("mysql2/promise");

async function checkSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "dacn",
    });

    console.log("🔍 Checking table schemas...\n");

    // Check projects table
    const [projectsSchema] = await connection.query(
      "SHOW CREATE TABLE projects"
    );
    console.log("📋 PROJECTS table:");
    console.log(projectsSchema[0]["Create Table"]);
    console.log("\n" + "=".repeat(80) + "\n");

    // Check departments table
    const [deptsSchema] = await connection.query(
      "SHOW CREATE TABLE departments"
    );
    console.log("📋 DEPARTMENTS table:");
    console.log(deptsSchema[0]["Create Table"]);
    console.log("\n" + "=".repeat(80) + "\n");

    // Check teams table
    const [teamsSchema] = await connection.query("SHOW CREATE TABLE teams");
    console.log("📋 TEAMS table:");
    console.log(teamsSchema[0]["Create Table"]);
    console.log("\n" + "=".repeat(80) + "\n");

    // Check users table
    const [usersSchema] = await connection.query("SHOW CREATE TABLE users");
    console.log("📋 USERS table:");
    console.log(usersSchema[0]["Create Table"]);

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
  }
}

checkSchema();

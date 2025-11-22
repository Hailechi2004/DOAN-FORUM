/**
 * Export Database with Sample Data
 * Script to export both schema and data
 * Usage: node export-database-with-data.js
 */

const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "company_forum",
};

const outputFile = path.join(
  __dirname,
  "database",
  "FULL_DATABASE_WITH_DATA.sql"
);

/**
 * Escape SQL string
 */
function escapeSqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  }
  // Escape string
  return `'${String(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
}

/**
 * Get all tables
 */
async function getAllTables(connection) {
  const [tables] = await connection.query("SHOW TABLES");
  return tables.map((row) => Object.values(row)[0]);
}

/**
 * Get table CREATE statement
 */
async function getTableCreateStatement(connection, tableName) {
  const [result] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
  return result[0]["Create Table"];
}

/**
 * Get table data
 */
async function getTableData(connection, tableName) {
  const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
  return rows;
}

/**
 * Get table columns
 */
async function getTableColumns(connection, tableName) {
  const [columns] = await connection.query(
    `SHOW COLUMNS FROM \`${tableName}\``
  );
  return columns.map((col) => col.Field);
}

/**
 * Generate INSERT statements
 */
function generateInsertStatements(tableName, columns, data) {
  if (data.length === 0) {
    return [`-- No data in table ${tableName}`];
  }

  const statements = [];
  const columnList = columns.map((col) => `\`${col}\``).join(", ");

  // Batch inserts (100 rows per batch)
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch.map((row) => {
      const vals = columns.map((col) => escapeSqlValue(row[col])).join(", ");
      return `  (${vals})`;
    });

    statements.push(`INSERT INTO \`${tableName}\` (${columnList}) VALUES`);
    statements.push(values.join(",\n") + ";");
  }

  return statements;
}

/**
 * Main export function
 */
async function exportDatabaseWithData() {
  let connection;

  try {
    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database:", dbConfig.database);

    let sqlContent = [];

    // Header
    sqlContent.push(
      "-- ================================================================"
    );
    sqlContent.push("-- COMPLETE DATABASE EXPORT WITH SAMPLE DATA");
    sqlContent.push(`-- Database: ${dbConfig.database}`);
    sqlContent.push(`-- Exported: ${new Date().toISOString()}`);
    sqlContent.push(
      "-- ================================================================\n"
    );

    sqlContent.push(`DROP DATABASE IF EXISTS \`${dbConfig.database}\`;`);
    sqlContent.push(
      `CREATE DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    sqlContent.push(`USE \`${dbConfig.database}\`;\n`);

    sqlContent.push("SET FOREIGN_KEY_CHECKS = 0;");
    sqlContent.push("SET AUTOCOMMIT = 0;");
    sqlContent.push("START TRANSACTION;\n");

    // Get all tables
    console.log("\n📋 Fetching tables...");
    const tables = await getAllTables(connection);
    console.log(`Found ${tables.length} tables\n`);

    let totalRows = 0;

    // Export each table
    for (const tableName of tables) {
      console.log(`📊 Processing table: ${tableName}`);

      // Get CREATE statement
      const createStatement = await getTableCreateStatement(
        connection,
        tableName
      );
      sqlContent.push(
        `-- ================================================================`
      );
      sqlContent.push(`-- Table: ${tableName}`);
      sqlContent.push(
        `-- ================================================================`
      );
      sqlContent.push(`DROP TABLE IF EXISTS \`${tableName}\`;\n`);
      sqlContent.push(createStatement + ";\n");

      // Get data
      const data = await getTableData(connection, tableName);
      console.log(`  ├─ Rows: ${data.length}`);
      totalRows += data.length;

      if (data.length > 0) {
        const columns = await getTableColumns(connection, tableName);
        const insertStatements = generateInsertStatements(
          tableName,
          columns,
          data
        );
        sqlContent.push(`-- Data for table: ${tableName}`);
        sqlContent.push(insertStatements.join("\n"));
        sqlContent.push("");
      } else {
        sqlContent.push(`-- No data for table: ${tableName}\n`);
      }
    }

    // Footer
    sqlContent.push("\nCOMMIT;");
    sqlContent.push("SET FOREIGN_KEY_CHECKS = 1;");
    sqlContent.push("SET AUTOCOMMIT = 1;\n");

    sqlContent.push(
      "-- ================================================================"
    );
    sqlContent.push("-- EXPORT SUMMARY");
    sqlContent.push(`-- Total Tables: ${tables.length}`);
    sqlContent.push(`-- Total Rows: ${totalRows}`);
    sqlContent.push(
      "-- ================================================================"
    );

    // Write to file
    console.log("\n💾 Writing to file...");
    await fs.writeFile(outputFile, sqlContent.join("\n"), "utf8");

    // Get file size
    const stats = await fs.stat(outputFile);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log("\n✅ Export completed successfully!");
    console.log(`📁 Output file: ${outputFile}`);
    console.log(`📊 Total tables: ${tables.length}`);
    console.log(`📝 Total rows: ${totalRows}`);
    console.log(`💾 File size: ${fileSizeMB} MB`);

    // Generate summary
    const summary = {
      database: dbConfig.database,
      exported_at: new Date().toISOString(),
      tables: tables.length,
      total_rows: totalRows,
      file_size_mb: fileSizeMB,
      output_file: outputFile,
    };

    const summaryFile = path.join(
      __dirname,
      "database",
      "EXPORT_WITH_DATA_SUMMARY.json"
    );
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2), "utf8");
    console.log(`📋 Summary saved to: ${summaryFile}`);
  } catch (error) {
    console.error("❌ Error exporting database:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

// Run export
console.log("🚀 Starting database export with data...\n");
exportDatabaseWithData();

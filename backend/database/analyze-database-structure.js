const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function analyzeDatabase() {
  let connection;

  try {
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "company_forum",
    };

    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database!\n");

    // Get all tables
    const [tables] = await connection.query(
      `
      SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, CREATE_TIME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `,
      [dbConfig.database]
    );

    console.log("=".repeat(100));
    console.log("📊 DATABASE STRUCTURE ANALYSIS");
    console.log("=".repeat(100));
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Total Tables: ${tables.length}\n`);

    let report = {
      database: dbConfig.database,
      totalTables: tables.length,
      tables: [],
      relationships: [],
      issues: [],
      recommendations: [],
    };

    // Analyze each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;

      console.log("\n" + "─".repeat(100));
      console.log(`📋 TABLE: ${tableName}`);
      console.log("─".repeat(100));
      console.log(
        `Rows: ${table.TABLE_ROWS} | Size: ${(table.DATA_LENGTH / 1024).toFixed(2)} KB | Created: ${table.CREATE_TIME}`
      );

      // Get columns
      const [columns] = await connection.query(
        `
        SELECT 
          COLUMN_NAME, 
          COLUMN_TYPE, 
          IS_NULLABLE, 
          COLUMN_KEY, 
          COLUMN_DEFAULT, 
          EXTRA,
          COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `,
        [dbConfig.database, tableName]
      );

      // Get foreign keys
      const [foreignKeys] = await connection.query(
        `
        SELECT 
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `,
        [dbConfig.database, tableName]
      );

      // Get indexes
      const [indexes] = await connection.query(`
        SHOW INDEX FROM ${tableName}
      `);

      console.log("\n📌 COLUMNS:");
      console.log("-".repeat(100));

      const tableData = {
        name: tableName,
        rowCount: table.TABLE_ROWS,
        size: (table.DATA_LENGTH / 1024).toFixed(2) + " KB",
        columns: [],
        foreignKeys: [],
        indexes: [],
        primaryKey: null,
        issues: [],
      };

      columns.forEach((col) => {
        const colInfo = `  ${col.COLUMN_KEY === "PRI" ? "🔑" : col.COLUMN_KEY === "MUL" ? "🔗" : "  "} ${col.COLUMN_NAME.padEnd(30)} ${col.COLUMN_TYPE.padEnd(20)} ${col.IS_NULLABLE === "NO" ? "NOT NULL" : "NULL".padEnd(8)} ${col.COLUMN_DEFAULT !== null ? "DEFAULT " + col.COLUMN_DEFAULT : ""} ${col.EXTRA} ${col.COLUMN_COMMENT ? "// " + col.COLUMN_COMMENT : ""}`;
        console.log(colInfo);

        tableData.columns.push({
          name: col.COLUMN_NAME,
          type: col.COLUMN_TYPE,
          nullable: col.IS_NULLABLE === "YES",
          key: col.COLUMN_KEY,
          default: col.COLUMN_DEFAULT,
          extra: col.EXTRA,
          comment: col.COLUMN_COMMENT,
        });

        if (col.COLUMN_KEY === "PRI") {
          tableData.primaryKey = col.COLUMN_NAME;
        }

        // Check for potential issues
        if (
          col.COLUMN_NAME.includes("_id") &&
          col.COLUMN_KEY !== "MUL" &&
          col.COLUMN_KEY !== "PRI"
        ) {
          tableData.issues.push(
            `Column ${col.COLUMN_NAME} looks like a foreign key but has no index`
          );
        }
      });

      if (foreignKeys.length > 0) {
        console.log("\n🔗 FOREIGN KEYS:");
        console.log("-".repeat(100));
        foreignKeys.forEach((fk) => {
          console.log(
            `  ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`
          );
          tableData.foreignKeys.push({
            column: fk.COLUMN_NAME,
            referencedTable: fk.REFERENCED_TABLE_NAME,
            referencedColumn: fk.REFERENCED_COLUMN_NAME,
          });

          report.relationships.push({
            from: tableName,
            column: fk.COLUMN_NAME,
            to: fk.REFERENCED_TABLE_NAME,
            toColumn: fk.REFERENCED_COLUMN_NAME,
          });
        });
      }

      if (indexes.length > 0) {
        console.log("\n📇 INDEXES:");
        console.log("-".repeat(100));
        const uniqueIndexes = [...new Set(indexes.map((idx) => idx.Key_name))];
        uniqueIndexes.forEach((idxName) => {
          const idxColumns = indexes
            .filter((i) => i.Key_name === idxName)
            .map((i) => i.Column_name);
          const nonUnique = indexes.find(
            (i) => i.Key_name === idxName
          ).Non_unique;
          console.log(
            `  ${nonUnique === 0 ? "🔒 UNIQUE" : "  "} ${idxName}: (${idxColumns.join(", ")})`
          );

          tableData.indexes.push({
            name: idxName,
            columns: idxColumns,
            unique: nonUnique === 0,
          });
        });
      }

      // Get sample data
      try {
        const [sampleData] = await connection.query(
          `SELECT * FROM ${tableName} LIMIT 3`
        );
        if (sampleData.length > 0) {
          console.log("\n📊 SAMPLE DATA (first 3 rows):");
          console.log("-".repeat(100));
          console.log(
            JSON.stringify(sampleData, null, 2).substring(0, 500) + "..."
          );
        }
      } catch (err) {
        console.log(`\n⚠️  Could not fetch sample data: ${err.message}`);
      }

      report.tables.push(tableData);
    }

    // Analyze relationships and find orphaned tables
    console.log("\n\n" + "=".repeat(100));
    console.log("🔍 RELATIONSHIP ANALYSIS");
    console.log("=".repeat(100));

    const referencedTables = new Set(report.relationships.map((r) => r.to));
    const referencingTables = new Set(report.relationships.map((r) => r.from));
    const allTableNames = tables.map((t) => t.TABLE_NAME);

    console.log("\n📊 Table Categories:");
    console.log("-".repeat(100));

    // Core tables (referenced by others)
    const coreTables = allTableNames.filter(
      (t) => referencedTables.has(t) && !referencingTables.has(t)
    );
    console.log("\n🏛️  CORE TABLES (no dependencies, referenced by others):");
    coreTables.forEach((t) => console.log(`  • ${t}`));

    // Junction tables (both referenced and referencing)
    const junctionTables = allTableNames.filter(
      (t) => referencedTables.has(t) && referencingTables.has(t)
    );
    console.log("\n🔗 JUNCTION/RELATIONSHIP TABLES:");
    junctionTables.forEach((t) => console.log(`  • ${t}`));

    // Leaf tables (only referencing, not referenced)
    const leafTables = allTableNames.filter(
      (t) => !referencedTables.has(t) && referencingTables.has(t)
    );
    console.log("\n🍃 LEAF TABLES (depend on others, not referenced):");
    leafTables.forEach((t) => console.log(`  • ${t}`));

    // Isolated tables (no relationships)
    const isolatedTables = allTableNames.filter(
      (t) => !referencedTables.has(t) && !referencingTables.has(t)
    );
    console.log("\n🏝️  ISOLATED TABLES (no foreign key relationships):");
    isolatedTables.forEach((t) => console.log(`  • ${t}`));

    // Issues and recommendations
    console.log("\n\n" + "=".repeat(100));
    console.log("⚠️  ISSUES & RECOMMENDATIONS");
    console.log("=".repeat(100));

    // Check for tables with no primary key
    report.tables.forEach((table) => {
      if (!table.primaryKey) {
        const issue = `❌ Table '${table.name}' has NO PRIMARY KEY`;
        console.log(issue);
        report.issues.push(issue);
      }

      // Check for tables with no indexes (except PK)
      if (table.indexes.length <= 1) {
        const issue = `⚠️  Table '${table.name}' has no additional indexes (might be slow for queries)`;
        console.log(issue);
        report.recommendations.push(issue);
      }

      // Print table-specific issues
      table.issues.forEach((issue) => {
        console.log(`⚠️  ${table.name}: ${issue}`);
        report.issues.push(`${table.name}: ${issue}`);
      });
    });

    // Check for naming inconsistencies
    console.log("\n📝 NAMING ANALYSIS:");
    console.log("-".repeat(100));

    const pkNamingIssues = report.tables.filter(
      (t) =>
        t.primaryKey && t.primaryKey !== "id" && !t.primaryKey.endsWith("_id")
    );
    if (pkNamingIssues.length > 0) {
      console.log("⚠️  Non-standard primary key names:");
      pkNamingIssues.forEach((t) =>
        console.log(`  • ${t.name}.${t.primaryKey}`)
      );
    }

    // Check for workflow tables consistency
    console.log("\n\n" + "=".repeat(100));
    console.log("🔄 WORKFLOW TABLES CHECK");
    console.log("=".repeat(100));

    const workflowTables = [
      "project_department_tasks",
      "project_member_tasks",
      "project_task_reports",
      "project_warnings",
      "project_task_reminders",
    ];

    for (const wfTable of workflowTables) {
      const exists = tables.find((t) => t.TABLE_NAME === wfTable);
      if (exists) {
        console.log(`✅ ${wfTable} - ${exists.TABLE_ROWS} rows`);
      } else {
        console.log(`❌ ${wfTable} - NOT FOUND`);
        report.issues.push(`Missing workflow table: ${wfTable}`);
      }
    }

    // Save report to file
    const reportPath = path.join(__dirname, "database-analysis-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n\n📄 Full report saved to: ${reportPath}`);

    // Generate summary
    console.log("\n\n" + "=".repeat(100));
    console.log("📊 SUMMARY");
    console.log("=".repeat(100));
    console.log(`Total Tables: ${report.totalTables}`);
    console.log(`Total Relationships: ${report.relationships.length}`);
    console.log(`Core Tables: ${coreTables.length}`);
    console.log(`Junction Tables: ${junctionTables.length}`);
    console.log(`Leaf Tables: ${leafTables.length}`);
    console.log(`Isolated Tables: ${isolatedTables.length}`);
    console.log(`Issues Found: ${report.issues.length}`);
    console.log(`Recommendations: ${report.recommendations.length}`);

    console.log("\n✅ Analysis complete!");
  } catch (error) {
    console.error("\n❌ Analysis failed:");
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

analyzeDatabase();

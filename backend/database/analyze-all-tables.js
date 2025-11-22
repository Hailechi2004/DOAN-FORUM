const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function analyzeAllTables() {
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
      SELECT TABLE_NAME, TABLE_ROWS, 
             ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024, 2) as SIZE_KB,
             ENGINE, TABLE_COLLATION
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `,
      [dbConfig.database]
    );

    console.log("📊 DATABASE OVERVIEW");
    console.log("=".repeat(100));
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Total Tables: ${tables.length}`);
    console.log(
      `Total Size: ${tables.reduce((sum, t) => sum + parseFloat(t.SIZE_KB || 0), 0).toFixed(2)} KB\n`
    );

    const analysis = {
      database: dbConfig.database,
      totalTables: tables.length,
      timestamp: new Date().toISOString(),
      tables: [],
    };

    // Analyze each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`\n${"=".repeat(100)}`);
      console.log(`📋 TABLE: ${tableName}`);
      console.log("=".repeat(100));
      console.log(
        `Rows: ${table.TABLE_ROWS} | Size: ${table.SIZE_KB} KB | Engine: ${table.ENGINE}`
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

      console.log("\n📝 COLUMNS:");
      console.log("-".repeat(100));

      const columnInfo = [];
      columns.forEach((col, idx) => {
        const key = col.COLUMN_KEY ? `[${col.COLUMN_KEY}]` : "";
        const nullable = col.IS_NULLABLE === "YES" ? "NULL" : "NOT NULL";
        const extra = col.EXTRA ? `(${col.EXTRA})` : "";
        const comment = col.COLUMN_COMMENT ? `// ${col.COLUMN_COMMENT}` : "";

        console.log(
          `  ${(idx + 1).toString().padStart(2)}. ${col.COLUMN_NAME.padEnd(25)} ${col.COLUMN_TYPE.padEnd(20)} ${nullable.padEnd(10)} ${key.padEnd(6)} ${extra} ${comment}`
        );

        columnInfo.push({
          name: col.COLUMN_NAME,
          type: col.COLUMN_TYPE,
          nullable: col.IS_NULLABLE === "YES",
          key: col.COLUMN_KEY,
          default: col.COLUMN_DEFAULT,
          extra: col.EXTRA,
          comment: col.COLUMN_COMMENT,
        });
      });

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
        ORDER BY CONSTRAINT_NAME
      `,
        [dbConfig.database, tableName]
      );

      if (foreignKeys.length > 0) {
        console.log("\n🔗 FOREIGN KEYS:");
        console.log("-".repeat(100));
        foreignKeys.forEach((fk, idx) => {
          console.log(
            `  ${(idx + 1).toString().padStart(2)}. ${fk.COLUMN_NAME.padEnd(25)} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`
          );
        });
      }

      // Get indexes
      const [indexes] = await connection.query(
        `
        SELECT 
          INDEX_NAME,
          GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
          NON_UNIQUE,
          INDEX_TYPE
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        GROUP BY INDEX_NAME, NON_UNIQUE, INDEX_TYPE
        ORDER BY INDEX_NAME
      `,
        [dbConfig.database, tableName]
      );

      if (indexes.length > 0) {
        console.log("\n🗂️  INDEXES:");
        console.log("-".repeat(100));
        indexes.forEach((idx, i) => {
          const unique = idx.NON_UNIQUE === 0 ? "UNIQUE" : "INDEX";
          console.log(
            `  ${(i + 1).toString().padStart(2)}. ${idx.INDEX_NAME.padEnd(30)} (${idx.COLUMNS}) [${unique}]`
          );
        });
      }

      // Sample data (first 3 rows)
      try {
        const [rows] = await connection.query(
          `SELECT * FROM \`${tableName}\` LIMIT 3`
        );
        if (rows.length > 0) {
          console.log("\n📄 SAMPLE DATA (first 3 rows):");
          console.log("-".repeat(100));
          console.log(JSON.stringify(rows, null, 2));
        } else {
          console.log("\n📄 SAMPLE DATA: (empty table)");
        }
      } catch (err) {
        console.log(`\n⚠️  Could not fetch sample data: ${err.message}`);
      }

      // Add to analysis
      analysis.tables.push({
        name: tableName,
        rows: table.TABLE_ROWS,
        sizeKB: parseFloat(table.SIZE_KB || 0),
        engine: table.ENGINE,
        collation: table.TABLE_COLLATION,
        columns: columnInfo,
        foreignKeys: foreignKeys.map((fk) => ({
          column: fk.COLUMN_NAME,
          references: `${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`,
        })),
        indexes: indexes.map((idx) => ({
          name: idx.INDEX_NAME,
          columns: idx.COLUMNS,
          unique: idx.NON_UNIQUE === 0,
        })),
      });
    }

    // Category analysis
    console.log("\n\n" + "=".repeat(100));
    console.log("📊 TABLES BY CATEGORY");
    console.log("=".repeat(100));

    const categories = {
      "Core System": [],
      "User & Auth": [],
      Projects: [],
      Workflow: [],
      "Posts & Content": [],
      "Departments & Teams": [],
      Other: [],
    };

    tables.forEach((t) => {
      const name = t.TABLE_NAME;
      if (
        name.includes("project_department_task") ||
        name.includes("project_member_task") ||
        name.includes("project_task_report") ||
        name.includes("project_warning") ||
        name.includes("project_task_reminder")
      ) {
        categories["Workflow"].push(name);
      } else if (name.startsWith("project_")) {
        categories["Projects"].push(name);
      } else if (
        name.includes("user") ||
        name.includes("profile") ||
        name.includes("role") ||
        name.includes("permission") ||
        name.includes("session")
      ) {
        categories["User & Auth"].push(name);
      } else if (
        name.includes("post") ||
        name.includes("comment") ||
        name.includes("reaction")
      ) {
        categories["Posts & Content"].push(name);
      } else if (name.includes("department") || name.includes("team")) {
        categories["Departments & Teams"].push(name);
      } else if (
        name.includes("setting") ||
        name.includes("config") ||
        name.includes("log")
      ) {
        categories["Core System"].push(name);
      } else {
        categories["Other"].push(name);
      }
    });

    for (const [category, tableList] of Object.entries(categories)) {
      if (tableList.length > 0) {
        console.log(`\n${category} (${tableList.length} tables):`);
        tableList.forEach((t, idx) => {
          const tableData = tables.find((tb) => tb.TABLE_NAME === t);
          console.log(
            `  ${(idx + 1).toString().padStart(2)}. ${t.padEnd(40)} (${tableData.TABLE_ROWS} rows, ${tableData.SIZE_KB} KB)`
          );
        });
      }
    }

    analysis.categories = categories;

    // Relationship map
    console.log("\n\n" + "=".repeat(100));
    console.log("🔗 TABLE RELATIONSHIPS");
    console.log("=".repeat(100));

    const relationships = {};
    for (const table of analysis.tables) {
      if (table.foreignKeys.length > 0) {
        console.log(`\n${table.name}:`);
        table.foreignKeys.forEach((fk) => {
          console.log(`  └─> ${fk.column} -> ${fk.references}`);
        });
        relationships[table.name] = table.foreignKeys;
      }
    }

    analysis.relationships = relationships;

    // Recommendations
    console.log("\n\n" + "=".repeat(100));
    console.log("💡 RECOMMENDATIONS");
    console.log("=".repeat(100));

    const recommendations = [];

    // Check for tables without primary key
    analysis.tables.forEach((table) => {
      const hasPK = table.columns.some((col) => col.key === "PRI");
      if (!hasPK) {
        const rec = `⚠️  Table '${table.name}' has no PRIMARY KEY`;
        console.log(rec);
        recommendations.push(rec);
      }
    });

    // Check for empty tables
    const emptyTables = analysis.tables.filter((t) => t.rows === 0);
    if (emptyTables.length > 0) {
      console.log(`\n📭 Empty tables (${emptyTables.length}):`);
      emptyTables.forEach((t) => {
        const rec = `   - ${t.name}`;
        console.log(rec);
        recommendations.push(`Empty table: ${t.name}`);
      });
    }

    // Check for tables without indexes (except small tables)
    analysis.tables.forEach((table) => {
      if (table.rows > 100 && table.indexes.length <= 1) {
        const rec = `⚠️  Table '${table.name}' has ${table.rows} rows but only ${table.indexes.length} index(es)`;
        console.log(rec);
        recommendations.push(rec);
      }
    });

    // Check for duplicate/redundant tables
    const projectTasksTables = analysis.tables.filter(
      (t) => t.name.includes("task") && t.name.startsWith("project")
    );
    if (projectTasksTables.length > 3) {
      console.log(
        `\n🔍 Multiple task-related tables found (${projectTasksTables.length}):`
      );
      projectTasksTables.forEach((t) => {
        console.log(`   - ${t.name} (${t.rows} rows)`);
      });
      recommendations.push(
        `Review if all ${projectTasksTables.length} task tables are necessary`
      );
    }

    analysis.recommendations = recommendations;

    // Save to JSON
    const reportPath = path.join(__dirname, "database-full-analysis.json");
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n\n✅ Full analysis saved to: ${reportPath}`);

    // Summary
    console.log("\n\n" + "=".repeat(100));
    console.log("📈 SUMMARY");
    console.log("=".repeat(100));
    console.log(`Total Tables: ${analysis.totalTables}`);
    console.log(
      `Total Columns: ${analysis.tables.reduce((sum, t) => sum + t.columns.length, 0)}`
    );
    console.log(
      `Total Foreign Keys: ${analysis.tables.reduce((sum, t) => sum + t.foreignKeys.length, 0)}`
    );
    console.log(
      `Total Indexes: ${analysis.tables.reduce((sum, t) => sum + t.indexes.length, 0)}`
    );
    console.log(`Empty Tables: ${emptyTables.length}`);
    console.log(`Recommendations: ${recommendations.length}`);
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

analyzeAllTables();

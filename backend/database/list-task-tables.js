const db = require("../src/config/database");

async function listTables() {
  const [rows] = await db.query("SHOW TABLES LIKE '%task%'");
  console.log(rows);
  process.exit(0);
}

listTables();

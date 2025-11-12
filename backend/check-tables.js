const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  const [tables] = await conn.query("SHOW TABLES");
  console.log(`\n📊 Total tables: ${tables.length}\n`);
  tables.forEach((t, i) => {
    console.log(`${i + 1}. ${Object.values(t)[0]}`);
  });
  console.log("");

  await conn.end();
})();

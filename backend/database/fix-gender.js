const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function fixGenderValues() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("📝 Fixing gender values in profiles table...");

    // Convert to lowercase
    const [result1] = await connection.execute(`
      UPDATE profiles 
      SET gender = LOWER(gender) 
      WHERE gender IS NOT NULL 
        AND gender != ''
    `);
    console.log(
      `✅ Converted ${result1.affectedRows} gender values to lowercase`
    );

    // Set invalid values to 'unspecified'
    const [result2] = await connection.execute(`
      UPDATE profiles 
      SET gender = 'unspecified'
      WHERE gender NOT IN ('male', 'female', 'other', 'unspecified')
        OR gender IS NULL 
        OR gender = ''
    `);
    console.log(
      `✅ Fixed ${result2.affectedRows} invalid gender values to 'unspecified'`
    );

    // Check results
    const [rows] = await connection.execute(`
      SELECT gender, COUNT(*) as count 
      FROM profiles 
      GROUP BY gender
    `);

    console.log("\n📊 Current gender distribution:");
    rows.forEach((row) => {
      console.log(`   ${row.gender || "NULL"}: ${row.count}`);
    });

    console.log("\n✨ Gender values fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing gender values:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixGenderValues();

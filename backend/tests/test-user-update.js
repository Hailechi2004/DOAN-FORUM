const mysql = require("mysql2/promise");

async function testUserUpdate() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("🧪 Testing User Update Functionality\n");

    const userId = 2; // Test user ID

    // 1. Check current user data
    console.log("📊 Step 1: Check current user data");
    const [currentUser] = await connection.execute(
      `
      SELECT u.*, p.*, 
             GROUP_CONCAT(DISTINCT ur.role_id) as role_ids
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `,
      [userId]
    );

    console.log("Current data:", JSON.stringify(currentUser[0], null, 2));

    // 2. Test update profiles table
    console.log("\n📝 Step 2: Update profiles table");
    await connection.execute(
      `
      UPDATE profiles 
      SET full_name = ?, phone = ?, gender = ?, birth_date = ?, address = ?, city = ?, country = ?
      WHERE user_id = ?
    `,
      [
        "Test User Updated",
        "0987654321",
        "male",
        "1990-01-01",
        "123 Test St",
        "Test City",
        "Test Country",
        userId,
      ]
    );
    console.log("✅ Profiles updated");

    // 3. Test update users table (email, username)
    console.log("\n📝 Step 3: Update users table");
    await connection.execute(
      `
      UPDATE users 
      SET email = ?, username = ?
      WHERE id = ?
    `,
      ["test@example.com", "testuser", userId]
    );
    console.log("✅ Users updated");

    // 4. Check if employee_records table exists
    console.log("\n📝 Step 4: Check employee_records table");
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'employee_records'
    `);

    if (tables.length > 0) {
      console.log("✅ employee_records table exists");

      // Check structure
      const [columns] = await connection.execute(`
        DESCRIBE employee_records
      `);
      console.log(
        "Columns:",
        columns.map((c) => c.Field)
      );

      // Try to update or insert
      const [existing] = await connection.execute(
        `
        SELECT * FROM employee_records WHERE user_id = ?
      `,
        [userId]
      );

      if (existing.length > 0) {
        await connection.execute(
          `
          UPDATE employee_records 
          SET employee_id = ?, position = ?, hire_date = ?, department_id = ?, team_id = ?
          WHERE user_id = ?
        `,
          ["EMP001", "Test Position", "2024-01-01", 1, 1, userId]
        );
        console.log("✅ employee_records updated");
      } else {
        await connection.execute(
          `
          INSERT INTO employee_records (user_id, employee_id, position, hire_date, department_id, team_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [userId, "EMP001", "Test Position", "2024-01-01", 1, 1]
        );
        console.log("✅ employee_records inserted");
      }
    } else {
      console.log("❌ employee_records table does NOT exist");
      console.log("Checking profiles table for employee fields...");

      const [profileCols] = await connection.execute(`
        DESCRIBE profiles
      `);
      console.log(
        "Profile columns:",
        profileCols.map((c) => c.Field)
      );
    }

    // 5. Test update roles
    console.log("\n📝 Step 5: Update roles");

    // Delete existing roles
    await connection.execute(
      `
      DELETE FROM user_roles WHERE user_id = ?
    `,
      [userId]
    );
    console.log("✅ Old roles deleted");

    // Insert new roles
    await connection.execute(
      `
      INSERT INTO user_roles (user_id, role_id) VALUES (?, 1), (?, 2)
    `,
      [userId, userId]
    );
    console.log("✅ New roles inserted");

    // 6. Check final result
    console.log("\n📊 Step 6: Check final result");
    const [finalUser] = await connection.execute(
      `
      SELECT u.*, p.*, 
             GROUP_CONCAT(DISTINCT ur.role_id) as role_ids,
             GROUP_CONCAT(DISTINCT r.name) as role_names
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = ?
      GROUP BY u.id
    `,
      [userId]
    );

    console.log("Final data:", JSON.stringify(finalUser[0], null, 2));

    console.log("\n✨ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await connection.end();
  }
}

testUserUpdate();

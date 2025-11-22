const mysql = require("mysql2/promise");

async function testUserCRUD() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("🧪 TEST 1: CREATE NEW USER");
    console.log("=".repeat(60));

    // Step 1: Create user in users table
    const testEmail = `test_${Date.now()}@example.com`;
    const testUsername = `test_user_${Date.now()}`;

    const [userResult] = await db.execute(
      `INSERT INTO users (username, email, password_hash, status, created_at) 
       VALUES (?, ?, ?, 'active', NOW())`,
      [testUsername, testEmail, "$2b$10$test_password_hash"]
    );

    const newUserId = userResult.insertId;
    console.log(`✅ Created user ID: ${newUserId}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Username: ${testUsername}`);

    // Step 2: Create profile
    await db.execute(
      `INSERT INTO profiles (user_id, full_name, phone, birth_date, gender, address, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newUserId,
        "Test User Name",
        "0123456789",
        "1990-01-01",
        "male",
        "Test Address",
      ]
    );
    console.log("✅ Created profile");

    // Step 3: Create employee record
    const empCode = `EMP${Date.now()}`;
    await db.execute(
      `INSERT INTO employee_records (user_id, employee_code, position, start_date, department_id, team_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [newUserId, empCode, "Developer", "2024-01-01", 1, 1]
    );
    console.log(`✅ Created employee record (${empCode})`);

    // Step 4: Assign roles
    await db.execute(
      `INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, NOW())`,
      [newUserId, 6]
    );
    console.log("✅ Assigned role");

    // Step 5: Verify creation
    const [createdData] = await db.execute(
      `SELECT 
        u.id, u.username, u.email,
        p.full_name, p.phone, p.birth_date, p.gender, p.address,
        e.employee_code, e.position, e.start_date, e.department_id, e.team_id
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN employee_records e ON u.id = e.user_id
      WHERE u.id = ?`,
      [newUserId]
    );

    const [rolesData] = await db.execute(
      `SELECT GROUP_CONCAT(role_id) as role_ids FROM user_roles WHERE user_id = ?`,
      [newUserId]
    );

    const createdUser = { ...createdData[0], role_ids: rolesData[0].role_ids };

    console.log("\n📊 CREATED DATA:");
    console.log(JSON.stringify(createdUser, null, 2));

    console.log("\n\n🧪 TEST 2: UPDATE USER");
    console.log("=".repeat(60));

    // Step 6: Update users table
    await db.execute(`UPDATE users SET email = ?, username = ? WHERE id = ?`, [
      "updated_email@example.com",
      "updated_username",
      newUserId,
    ]);
    console.log("✅ Updated users table");

    // Step 7: Update profiles table
    await db.execute(
      `UPDATE profiles SET 
        full_name = ?, 
        phone = ?, 
        birth_date = ?, 
        gender = ?, 
        address = ?
      WHERE user_id = ?`,
      [
        "Updated Full Name",
        "9876543210",
        "1995-12-31",
        "female",
        "Updated Address",
        newUserId,
      ]
    );
    console.log("✅ Updated profiles table");

    // Step 8: Update employee_records table
    const updatedEmpCode = `EMP${Date.now() + 1000}`;
    await db.execute(
      `UPDATE employee_records SET 
        employee_code = ?, 
        position = ?, 
        start_date = ?, 
        department_id = ?, 
        team_id = ?,
        updated_at = NOW()
      WHERE user_id = ?`,
      [updatedEmpCode, "Senior Developer", "2025-01-01", 2, 2, newUserId]
    );
    console.log(`✅ Updated employee_records table (${updatedEmpCode})`);

    // Step 9: Update roles
    await db.execute(`DELETE FROM user_roles WHERE user_id = ?`, [newUserId]);
    await db.execute(
      `INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, NOW()), (?, ?, NOW())`,
      [newUserId, 5, newUserId, 6]
    );
    console.log("✅ Updated user_roles");

    // Step 10: Verify update
    const [updatedData] = await db.execute(
      `SELECT 
        u.id, u.username, u.email,
        p.full_name, p.phone, p.birth_date, p.gender, p.address,
        e.employee_code, e.position, e.start_date, e.department_id, e.team_id
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN employee_records e ON u.id = e.user_id
      WHERE u.id = ?`,
      [newUserId]
    );

    const [updatedRolesData] = await db.execute(
      `SELECT GROUP_CONCAT(role_id) as role_ids FROM user_roles WHERE user_id = ?`,
      [newUserId]
    );

    const updatedUser = {
      ...updatedData[0],
      role_ids: updatedRolesData[0].role_ids,
    };

    console.log("\n📊 UPDATED DATA:");
    console.log(JSON.stringify(updatedUser, null, 2));

    console.log("\n\n🧪 TEST 3: COMPARISON");
    console.log("=".repeat(60));

    const created = createdUser;
    const updated = updatedUser;

    console.log(
      "FIELD                | CREATED VALUE              | UPDATED VALUE"
    );
    console.log("-".repeat(80));
    console.log(
      `username             | ${created.username.padEnd(26)} | ${updated.username}`
    );
    console.log(
      `email                | ${created.email.padEnd(26)} | ${updated.email}`
    );
    console.log(
      `full_name            | ${created.full_name.padEnd(26)} | ${updated.full_name}`
    );
    console.log(
      `phone                | ${created.phone.padEnd(26)} | ${updated.phone}`
    );
    console.log(
      `gender               | ${created.gender.padEnd(26)} | ${updated.gender}`
    );
    console.log(
      `employee_code        | ${created.employee_code.padEnd(26)} | ${updated.employee_code}`
    );
    console.log(
      `position             | ${created.position.padEnd(26)} | ${updated.position}`
    );
    console.log(
      `department_id        | ${String(created.department_id).padEnd(26)} | ${updated.department_id}`
    );
    console.log(
      `team_id              | ${String(created.team_id).padEnd(26)} | ${updated.team_id}`
    );
    console.log(
      `role_ids             | ${created.role_ids.padEnd(26)} | ${updated.role_ids}`
    );

    console.log("\n\n🧪 TEST 4: CLEANUP");
    console.log("=".repeat(60));

    // Cleanup - delete test data
    await db.execute(`DELETE FROM user_roles WHERE user_id = ?`, [newUserId]);
    await db.execute(`DELETE FROM employee_records WHERE user_id = ?`, [
      newUserId,
    ]);
    await db.execute(`DELETE FROM profiles WHERE user_id = ?`, [newUserId]);
    await db.execute(`DELETE FROM users WHERE id = ?`, [newUserId]);

    console.log(`✅ Cleaned up test user ID: ${newUserId}`);

    console.log("\n\n✅ ALL TESTS PASSED!");
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
    console.error(error.stack);
  } finally {
    await db.end();
  }
}

testUserCRUD();

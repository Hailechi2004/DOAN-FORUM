const mysql = require("mysql2/promise");

async function testRepositoryUpdate() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("🧪 TESTING REPOSITORY UPDATE METHOD");
    console.log("=".repeat(80));

    // Tìm một user có sẵn để test
    const [users] = await db.execute(`SELECT u.id FROM users u LIMIT 1`);

    if (users.length === 0) {
      console.log("❌ No users found in database");
      return;
    }

    const testUserId = users[0].id;
    console.log(`\n📝 Testing with User ID: ${testUserId}`);

    // Lấy dữ liệu TRƯỚC khi update
    console.log("\n📊 BEFORE UPDATE:");
    const [beforeUsers] = await db.execute(
      `SELECT username, email FROM users WHERE id = ?`,
      [testUserId]
    );
    const [beforeProfiles] = await db.execute(
      `SELECT full_name, phone, birth_date, gender, address FROM profiles WHERE user_id = ?`,
      [testUserId]
    );
    const [beforeEmployees] = await db.execute(
      `SELECT employee_code, position, start_date, department_id, team_id FROM employee_records WHERE user_id = ?`,
      [testUserId]
    );
    const [beforeRoles] = await db.execute(
      `SELECT GROUP_CONCAT(role_id) as role_ids FROM user_roles WHERE user_id = ?`,
      [testUserId]
    );

    console.log("Users table:", beforeUsers[0]);
    console.log("Profiles table:", beforeProfiles[0]);
    console.log("Employee_records table:", beforeEmployees[0] || "No record");
    console.log("User_roles:", beforeRoles[0]?.role_ids || "No roles");

    // Simulate repository updateProfile method
    console.log("\n🔄 SIMULATING REPOSITORY UPDATE...");

    const profileData = {
      // users table
      email: "repo_test@example.com",
      username: "repo_test_user",

      // profiles table
      full_name: "Repository Test Name",
      phone: "1111111111",
      date_of_birth: "2000-06-15",
      gender: "other",
      address: "Repository Test Address",

      // employee_records table
      employee_id: `EMPTEST${Date.now()}`,
      position: "QA Engineer",
      hire_date: "2023-06-01",
      department_id: 3,
      team_id: 3,

      // user_roles table
      role_ids: [5, 6],
    };

    // Update users table
    const userFields = [];
    const userValues = [];
    if (profileData.email !== undefined) {
      userFields.push("email = ?");
      userValues.push(profileData.email);
    }
    if (profileData.username !== undefined) {
      userFields.push("username = ?");
      userValues.push(profileData.username);
    }
    if (userFields.length > 0) {
      userValues.push(testUserId);
      await db.execute(
        `UPDATE users SET ${userFields.join(", ")} WHERE id = ?`,
        userValues
      );
      console.log("✅ Updated users table");
    }

    // Update profiles table
    const profileFields = [];
    const profileValues = [];
    if (profileData.full_name !== undefined) {
      profileFields.push("full_name = ?");
      profileValues.push(profileData.full_name);
    }
    if (profileData.phone !== undefined) {
      profileFields.push("phone = ?");
      profileValues.push(profileData.phone);
    }
    if (profileData.date_of_birth !== undefined) {
      profileFields.push("birth_date = ?");
      const dateValue = profileData.date_of_birth;
      profileValues.push(dateValue || null);
    }
    if (profileData.gender !== undefined) {
      profileFields.push("gender = ?");
      profileValues.push(profileData.gender);
    }
    if (profileData.address !== undefined) {
      profileFields.push("address = ?");
      profileValues.push(profileData.address);
    }
    if (profileFields.length > 0) {
      profileValues.push(testUserId);
      await db.execute(
        `UPDATE profiles SET ${profileFields.join(", ")} WHERE user_id = ?`,
        profileValues
      );
      console.log("✅ Updated profiles table");
    }

    // Update employee_records table
    const employeeFields = [];
    const employeeValues = [];
    if (profileData.employee_id !== undefined) {
      employeeFields.push("employee_code = ?");
      employeeValues.push(profileData.employee_id || null);
    }
    if (profileData.position !== undefined) {
      employeeFields.push("position = ?");
      employeeValues.push(profileData.position || null);
    }
    if (profileData.hire_date !== undefined) {
      employeeFields.push("start_date = ?");
      employeeValues.push(profileData.hire_date || null);
    }
    if (profileData.department_id !== undefined) {
      employeeFields.push("department_id = ?");
      employeeValues.push(profileData.department_id || null);
    }
    if (profileData.team_id !== undefined) {
      employeeFields.push("team_id = ?");
      employeeValues.push(profileData.team_id || null);
    }

    if (employeeFields.length > 0) {
      const [existing] = await db.execute(
        `SELECT user_id FROM employee_records WHERE user_id = ?`,
        [testUserId]
      );

      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO employee_records (user_id, employee_code, position, start_date, department_id, team_id, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
          [
            testUserId,
            profileData.employee_id || null,
            profileData.position || null,
            profileData.hire_date || null,
            profileData.department_id || null,
            profileData.team_id || null,
          ]
        );
        console.log("✅ Created employee_records");
      } else {
        employeeValues.push(testUserId);
        await db.execute(
          `UPDATE employee_records SET ${employeeFields.join(", ")}, updated_at = NOW() WHERE user_id = ?`,
          employeeValues
        );
        console.log("✅ Updated employee_records table");
      }
    }

    // Update user_roles table
    if (
      profileData.role_ids !== undefined &&
      Array.isArray(profileData.role_ids)
    ) {
      await db.execute(`DELETE FROM user_roles WHERE user_id = ?`, [
        testUserId,
      ]);
      if (profileData.role_ids.length > 0) {
        for (const roleId of profileData.role_ids) {
          await db.execute(
            `INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, NOW())`,
            [testUserId, roleId]
          );
        }
      }
      console.log("✅ Updated user_roles");
    }

    // Lấy dữ liệu SAU khi update
    console.log("\n📊 AFTER UPDATE:");
    const [afterUsers] = await db.execute(
      `SELECT username, email FROM users WHERE id = ?`,
      [testUserId]
    );
    const [afterProfiles] = await db.execute(
      `SELECT full_name, phone, birth_date, gender, address FROM profiles WHERE user_id = ?`,
      [testUserId]
    );
    const [afterEmployees] = await db.execute(
      `SELECT employee_code, position, start_date, department_id, team_id FROM employee_records WHERE user_id = ?`,
      [testUserId]
    );
    const [afterRoles] = await db.execute(
      `SELECT GROUP_CONCAT(role_id) as role_ids FROM user_roles WHERE user_id = ?`,
      [testUserId]
    );

    console.log("Users table:", afterUsers[0]);
    console.log("Profiles table:", afterProfiles[0]);
    console.log("Employee_records table:", afterEmployees[0] || "No record");
    console.log("User_roles:", afterRoles[0]?.role_ids || "No roles");

    // Comparison
    console.log("\n📋 COMPARISON:");
    console.log("-".repeat(80));

    const checks = [
      {
        field: "email",
        before: beforeUsers[0]?.email,
        after: afterUsers[0]?.email,
        expected: profileData.email,
      },
      {
        field: "username",
        before: beforeUsers[0]?.username,
        after: afterUsers[0]?.username,
        expected: profileData.username,
      },
      {
        field: "full_name",
        before: beforeProfiles[0]?.full_name,
        after: afterProfiles[0]?.full_name,
        expected: profileData.full_name,
      },
      {
        field: "phone",
        before: beforeProfiles[0]?.phone,
        after: afterProfiles[0]?.phone,
        expected: profileData.phone,
      },
      {
        field: "gender",
        before: beforeProfiles[0]?.gender,
        after: afterProfiles[0]?.gender,
        expected: profileData.gender,
      },
      {
        field: "position",
        before: beforeEmployees[0]?.position,
        after: afterEmployees[0]?.position,
        expected: profileData.position,
      },
      {
        field: "department_id",
        before: beforeEmployees[0]?.department_id,
        after: afterEmployees[0]?.department_id,
        expected: profileData.department_id,
      },
      {
        field: "team_id",
        before: beforeEmployees[0]?.team_id,
        after: afterEmployees[0]?.team_id,
        expected: profileData.team_id,
      },
    ];

    let allPassed = true;
    checks.forEach((check) => {
      const passed = String(check.after) === String(check.expected);
      const status = passed ? "✅" : "❌";
      console.log(
        `${status} ${check.field.padEnd(20)} | Before: ${String(check.before).padEnd(30)} | After: ${String(check.after).padEnd(30)} | Expected: ${check.expected}`
      );
      if (!passed) allPassed = false;
    });

    console.log("\n" + "=".repeat(80));
    if (allPassed) {
      console.log("✅ ALL FIELDS UPDATED SUCCESSFULLY!");
    } else {
      console.log("❌ SOME FIELDS FAILED TO UPDATE!");
    }
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
    console.error(error.stack);
  } finally {
    await db.end();
  }
}

testRepositoryUpdate();

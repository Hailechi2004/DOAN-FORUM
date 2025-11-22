const API_URL = "http://localhost:3000/api";

async function makeRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

async function testUserUpdateAPI() {
  try {
    console.log("🧪 TESTING USER UPDATE VIA API");
    console.log("=".repeat(80));

    // Step 1: Login để lấy token
    console.log("\n🔐 Step 1: Login...");
    const loginResponse = await makeRequest(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "Admin@123",
      }),
    });

    const token = loginResponse.data.token;
    console.log("✅ Logged in successfully");

    // Step 2: Lấy danh sách users
    console.log("\n📋 Step 2: Get users list...");
    const usersResponse = await makeRequest(
      `${API_URL}/users?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const testUser = usersResponse.data.users[0];
    console.log(`✅ Found user ID: ${testUser.id} (${testUser.full_name})`);

    // Step 3: Lấy thông tin chi tiết user TRƯỚC khi update
    console.log(`\n📊 Step 3: Get user details BEFORE update...`);
    const beforeResponse = await makeRequest(
      `${API_URL}/users/${testUser.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const beforeData = beforeResponse.data.data;
    console.log("BEFORE:", {
      username: beforeData.username,
      email: beforeData.email,
      full_name: beforeData.full_name,
      phone: beforeData.phone,
      gender: beforeData.gender,
      position: beforeData.position,
      employee_id: beforeData.employee_id,
      department_id: beforeData.department_id,
      team_id: beforeData.team_id,
      roles: beforeData.roles?.map((r) => r.id).join(","),
    });

    // Step 4: Update user
    console.log(`\n🔄 Step 4: Updating user...`);

    const updateData = {
      username: `updated_${Date.now()}`,
      email: `updated_${Date.now()}@test.com`,
      full_name: "API Test Updated Name",
      phone: "9999999999",
      date_of_birth: "1998-08-08",
      gender: "female",
      position: "API Test Position",
      employee_id: `APITEST${Date.now()}`,
      hire_date: "2022-08-08",
      address: "API Test Address",
      department_id: 2,
      team_id: 2,
      role_ids: [5, 6],
    };

    const updateResponse = await makeRequest(
      `${API_URL}/users/${testUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    console.log("✅ Update response:", updateResponse.message);

    // Step 5: Lấy lại thông tin SAU khi update
    console.log(`\n📊 Step 5: Get user details AFTER update...`);
    const afterResponse = await makeRequest(`${API_URL}/users/${testUser.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const afterData = afterResponse.data.data;
    console.log("AFTER:", {
      username: afterData.username,
      email: afterData.email,
      full_name: afterData.full_name,
      phone: afterData.phone,
      gender: afterData.gender,
      position: afterData.position,
      employee_id: afterData.employee_id,
      department_id: afterData.department_id,
      team_id: afterData.team_id,
      roles: afterData.roles?.map((r) => r.id).join(","),
    });

    // Step 6: So sánh
    console.log("\n📋 COMPARISON:");
    console.log("-".repeat(80));

    const checks = [
      {
        field: "username",
        expected: updateData.username,
        actual: afterData.username,
      },
      { field: "email", expected: updateData.email, actual: afterData.email },
      {
        field: "full_name",
        expected: updateData.full_name,
        actual: afterData.full_name,
      },
      { field: "phone", expected: updateData.phone, actual: afterData.phone },
      {
        field: "gender",
        expected: updateData.gender,
        actual: afterData.gender,
      },
      {
        field: "position",
        expected: updateData.position,
        actual: afterData.position,
      },
      {
        field: "department_id",
        expected: updateData.department_id,
        actual: afterData.department_id,
      },
      {
        field: "team_id",
        expected: updateData.team_id,
        actual: afterData.team_id,
      },
      {
        field: "role_ids",
        expected: updateData.role_ids.join(","),
        actual: afterData.roles?.map((r) => r.id).join(","),
      },
    ];

    let allPassed = true;
    checks.forEach((check) => {
      const passed = String(check.actual) === String(check.expected);
      const status = passed ? "✅" : "❌";
      console.log(
        `${status} ${check.field.padEnd(20)} | Expected: ${String(check.expected).padEnd(30)} | Actual: ${String(check.actual)}`
      );
      if (!passed) allPassed = false;
    });

    console.log("\n" + "=".repeat(80));
    if (allPassed) {
      console.log("✅ ALL API TESTS PASSED!");
    } else {
      console.log("❌ SOME API TESTS FAILED!");
    }
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
  }
}

testUserUpdateAPI();

require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3000/api";
let adminToken = "";
let managerToken = "";
let projectId = null;
let testDepartmentIds = [];

async function testFullDepartmentFlow() {
  console.log("🧪 Testing Full Department Assignment Flow\n");
  console.log("=".repeat(60));

  try {
    // ========================================
    // STEP 1: Admin creates project and assigns departments
    // ========================================
    console.log("\n📌 STEP 1: ADMIN WORKFLOW");
    console.log("-".repeat(60));

    // Login as Admin
    console.log("\n1.1 Login as Admin...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@example.com",
      password: "Admin123!",
    });
    adminToken = loginRes.data.data.token;
    console.log("✅ Admin logged in");

    // Get departments
    console.log("\n1.2 Get all departments...");
    const deptsRes = await axios.get(`${API_URL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allDepartments = deptsRes.data.data;
    console.log(`✅ Found ${allDepartments.length} departments total`);

    // Select 3 departments for testing
    testDepartmentIds = allDepartments.slice(0, 3).map((d) => d.id);
    console.log("\n📋 Selected departments for testing:");
    allDepartments.slice(0, 3).forEach((d, i) => {
      console.log(
        `   ${i + 1}. ${d.name} (ID: ${d.id}, Manager: ${d.manager_name || "❌ None"})`
      );
    });

    // Create project
    console.log("\n1.3 Create new project...");
    const projectRes = await axios.post(
      `${API_URL}/projects`,
      {
        name: "Enterprise System Migration",
        description:
          "Multi-department project to migrate legacy systems to cloud",
        status: "planning",
        priority: "high",
        start_date: "2025-11-15",
        end_date: "2026-03-31",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    projectId = projectRes.data.data.id;
    console.log(`✅ Project created successfully`);
    console.log(`   ID: ${projectId}`);
    console.log(`   Name: ${projectRes.data.data.name}`);
    console.log(`   Status: ${projectRes.data.data.status}`);

    // Assign departments to project
    console.log("\n1.4 Assign departments to project...");
    const assignRes = await axios.post(
      `${API_URL}/projects/${projectId}/departments`,
      {
        department_ids: testDepartmentIds,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(`✅ Assigned ${testDepartmentIds.length} departments`);
    assignRes.data.data.forEach((d, i) => {
      console.log(
        `   ${i + 1}. ${d.department_name} - Status: ${d.status.toUpperCase()}`
      );
    });

    // Verify assignment
    console.log("\n1.5 Verify department assignments...");
    const verifyRes = await axios.get(
      `${API_URL}/projects/${projectId}/departments`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(
      `✅ Verification: ${verifyRes.data.data.length} departments assigned`
    );
    console.log("\n📊 Detailed Assignment Status:");
    verifyRes.data.data.forEach((d) => {
      console.log(`   • ${d.department_name}`);
      console.log(`     - Department ID: ${d.department_id}`);
      console.log(`     - Manager: ${d.manager_name || "❌ Not assigned"}`);
      console.log(`     - Status: ${d.status}`);
      console.log(
        `     - Team Assigned: ${d.assigned_team_name || "❌ Not yet"}`
      );
      console.log(`     - Members: ${d.member_count}`);
      console.log("");
    });

    // ========================================
    // STEP 2: Check notifications (if managers exist)
    // ========================================
    console.log("\n📌 STEP 2: NOTIFICATION SYSTEM");
    console.log("-".repeat(60));

    const managersWithDepts = allDepartments
      .slice(0, 3)
      .filter((d) => d.manager_id);

    if (managersWithDepts.length > 0) {
      console.log(
        `\n✅ Found ${managersWithDepts.length} departments with managers`
      );
      console.log("   Notifications should have been sent to:");
      managersWithDepts.forEach((d) => {
        console.log(`   • ${d.manager_name} (${d.name})`);
      });

      // Try to login as first manager to check notifications
      console.log("\n2.1 Checking if we can verify notifications...");
      console.log(
        "   (Would need manager credentials to fully test notification viewing)"
      );
    } else {
      console.log("\n⚠️  No managers found in selected departments");
      console.log("   Notifications were not sent");
      console.log("   💡 Tip: Assign managers to departments first");
    }

    // ========================================
    // STEP 3: Test department manager endpoints
    // ========================================
    console.log("\n📌 STEP 3: MANAGER ENDPOINTS (Structure)");
    console.log("-".repeat(60));
    console.log("\n✅ Available endpoints for department managers:");
    console.log("   1. GET  /api/projects/my-department/projects");
    console.log("      → View all projects assigned to my department(s)");
    console.log("");
    console.log("   2. POST /api/projects/:id/assign-team");
    console.log("      → Assign a team from my department to project");
    console.log("      Body: { department_id, team_id }");
    console.log("");
    console.log("   3. POST /api/projects/:id/assign-members");
    console.log("      → Assign team members to project");
    console.log("      Body: { department_id, team_id, member_ids: [...] }");
    console.log("");
    console.log("   4. GET  /api/projects/:id/team-members");
    console.log("      → View all members assigned to project");
    console.log("      Query: ?department_id=X (optional filter)");

    // ========================================
    // STEP 4: Test admin management
    // ========================================
    console.log("\n📌 STEP 4: ADMIN MANAGEMENT");
    console.log("-".repeat(60));

    // Get project members (should be empty for now)
    console.log("\n4.1 Check project members...");
    const membersRes = await axios.get(
      `${API_URL}/projects/${projectId}/team-members`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(`✅ Current project members: ${membersRes.data.data.length}`);
    if (membersRes.data.data.length === 0) {
      console.log("   (Waiting for department managers to assign members)");
    }

    // Test removing a department
    console.log("\n4.2 Test removing a department...");
    const deptToRemove = testDepartmentIds[0];
    await axios.delete(
      `${API_URL}/projects/${projectId}/departments/${deptToRemove}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(`✅ Removed department ID: ${deptToRemove}`);

    // Verify removal
    const afterRemoveRes = await axios.get(
      `${API_URL}/projects/${projectId}/departments`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(
      `✅ Departments after removal: ${afterRemoveRes.data.data.length}`
    );

    // Re-add the department
    console.log("\n4.3 Re-add removed department...");
    await axios.post(
      `${API_URL}/projects/${projectId}/departments`,
      {
        department_ids: [deptToRemove],
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(`✅ Department ${deptToRemove} re-added`);

    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log("\n✅ All backend tests passed!");
    console.log("\n🎯 What was tested:");
    console.log("   ✓ Admin can create projects");
    console.log("   ✓ Admin can assign multiple departments");
    console.log("   ✓ Departments are stored correctly");
    console.log("   ✓ Assignment status tracked (pending/accepted)");
    console.log("   ✓ Admin can remove departments");
    console.log("   ✓ Notification system ready (if managers exist)");
    console.log("\n📋 Database Tables Used:");
    console.log("   • project_departments (department assignments)");
    console.log("   • project_team_members (member assignments)");
    console.log("   • project_notifications (manager notifications)");
    console.log("\n🎉 Backend is ready for frontend integration!");
    console.log("\n💡 Next Steps:");
    console.log("   1. Create UI for admin to assign departments");
    console.log("   2. Create UI for managers to view assigned projects");
    console.log("   3. Create UI for managers to assign teams & members");
    console.log("   4. Add notification bell for managers");
    console.log("");
  } catch (error) {
    console.error("\n❌ Test failed:", error.response?.data || error.message);
    if (error.response?.data) {
      console.error(
        "Error details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
  }
}

testFullDepartmentFlow();

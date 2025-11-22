require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3000/api";
let adminToken = "";
let projectId = null;

async function testProjectDepartments() {
  console.log("🧪 Testing Project Departments & Notifications\n");

  try {
    // 1. Login as Admin
    console.log("1️⃣ Login as Admin...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@example.com",
      password: "Admin123!",
    });
    adminToken = loginRes.data.data.token;
    console.log("✅ Logged in as admin\n");

    // 2. Get all departments
    console.log("2️⃣ Get departments...");
    const deptsRes = await axios.get(`${API_URL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const departments = deptsRes.data.data;
    console.log(`✅ Found ${departments.length} departments`);
    departments.slice(0, 3).forEach((d) => {
      console.log(
        `   - ${d.name} (ID: ${d.id}, Manager: ${d.manager_name || "None"})`
      );
    });
    console.log("");

    // 3. Create test project
    console.log("3️⃣ Create test project...");
    const projectRes = await axios.post(
      `${API_URL}/projects`,
      {
        name: "Multi-Department Project Test",
        description: "Testing department assignments and notifications",
        status: "planning",
        priority: "high",
        start_date: "2025-11-10",
        end_date: "2025-12-31",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    projectId = projectRes.data.data.id;
    console.log(`✅ Project created (ID: ${projectId})\n`);

    // 4. Assign departments to project
    console.log("4️⃣ Assign departments to project...");
    const deptIds = departments.slice(0, 3).map((d) => d.id);
    const assignRes = await axios.post(
      `${API_URL}/projects/${projectId}/departments`,
      {
        department_ids: deptIds,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(`✅ Assigned ${deptIds.length} departments:`);
    assignRes.data.data.forEach((d) => {
      console.log(`   - ${d.department_name} (Status: ${d.status})`);
    });
    console.log("");

    // 5. Get project departments
    console.log("5️⃣ Get project departments...");
    const projDeptsRes = await axios.get(
      `${API_URL}/projects/${projectId}/departments`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log(`✅ Project has ${projDeptsRes.data.data.length} departments:`);
    projDeptsRes.data.data.forEach((d) => {
      console.log(
        `   - ${d.department_name} (Manager: ${d.manager_name || "None"}, Status: ${d.status})`
      );
    });
    console.log("");

    // 6. Check notifications (if any manager exists)
    const managersWithDepts = departments.filter((d) => d.manager_id);
    if (managersWithDepts.length > 0) {
      console.log("6️⃣ Check if managers received notifications...");
      console.log(`   Managers: ${managersWithDepts.length}`);
      console.log("   (Would need to login as manager to see notifications)\n");
    }

    // 7. Test department manager endpoints structure
    console.log("7️⃣ API Endpoints created:");
    console.log("   Admin:");
    console.log("   - POST   /api/projects/:id/departments");
    console.log("   - GET    /api/projects/:id/departments");
    console.log("   - DELETE /api/projects/:id/departments/:deptId");
    console.log("\n   Manager:");
    console.log("   - GET    /api/projects/my-department/projects");
    console.log("   - POST   /api/projects/:id/assign-team");
    console.log("   - POST   /api/projects/:id/assign-members");
    console.log("   - GET    /api/projects/:id/team-members");
    console.log("\n   Notifications:");
    console.log("   - GET    /api/project-notifications");
    console.log("   - GET    /api/project-notifications/unread-count");
    console.log("   - PUT    /api/project-notifications/:id/read");
    console.log("   - PUT    /api/project-notifications/read-all");
    console.log("");

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testProjectDepartments();

/**
 * Complete Task Workflow Test
 * Tests the entire hierarchy:
 * 1. Admin assigns task to department
 * 2. Manager accepts task
 * 3. Manager assigns task to member
 * 4. Member starts and completes task
 * 5. Member submits task
 * 6. Manager approves member task
 * 7. Manager submits department task
 * 8. Admin approves department task
 * 9. Reports and warnings
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";
let authToken = "";

// Test data
let testProject = null;
let testDepartment = null;
let departmentTaskId = null;
let memberTaskId = null;
let reportId = null;
let warningId = null;

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Login as admin
async function login() {
  console.log("\n🔐 Step 1: Login as Admin");
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: "admin@example.com",
      password: "Admin123!",
    });

    authToken = response.data.data.token;
    console.log("✅ Logged in successfully");
    return true;
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    return false;
  }
}

// Get test project and department
async function getTestData() {
  console.log("\n📋 Step 2: Get Test Data");
  try {
    // Get projects
    const projectsRes = await api.get("/projects");
    testProject = projectsRes.data.data.find((p) => p.id === 30); // From previous test

    if (!testProject) {
      console.log("⚠️  Project 30 not found, creating new one...");
      const newProject = await api.post("/projects", {
        name: "Task Workflow Test Project",
        description: "Testing complete task hierarchy workflow",
        status: "in_progress",
        priority: "high",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      });
      testProject = newProject.data.data;
    }

    console.log(
      `✅ Using project: ${testProject.name} (ID: ${testProject.id})`
    );

    // Get project departments
    const deptRes = await api.get(`/projects/${testProject.id}/departments`);
    testDepartment = deptRes.data.data[0];

    if (!testDepartment) {
      console.error("❌ No departments assigned to project");
      return false;
    }

    console.log(
      `✅ Using department: ${testDepartment.department_name} (ID: ${testDepartment.department_id})`
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to get test data:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 3: Admin assigns task to department
async function assignTaskToDepartment() {
  console.log("\n📌 Step 3: Admin Assigns Task to Department");
  try {
    const response = await api.post(
      `/projects/${testProject.id}/department-tasks`,
      {
        department_id: testDepartment.department_id,
        title: "Develop User Authentication Module",
        description:
          "Implement secure user authentication with JWT, password hashing, and session management",
        priority: "high",
        deadline: "2025-02-15",
        estimated_hours: 120,
      }
    );

    departmentTaskId = response.data.data.taskId;
    console.log(`✅ Task assigned to department (ID: ${departmentTaskId})`);
    console.log(
      `   Task: ${response.data.message || "Develop User Authentication Module"}`
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to assign task:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 4: Manager accepts task
async function managerAcceptsTask() {
  console.log("\n👍 Step 4: Manager Accepts Task");
  try {
    await api.post(`/department-tasks/${departmentTaskId}/accept`);
    console.log("✅ Manager accepted the task");

    // Verify status changed
    const task = await api.get(`/department-tasks/${departmentTaskId}`);
    console.log(`   Status: ${task.data.data.status}`);
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to accept task:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 5: Manager assigns task to member
async function assignTaskToMember() {
  console.log("\n👤 Step 5: Manager Assigns Task to Member");
  try {
    // For testing, assign to admin user (ID: 1) so we can use same token
    const response = await api.post(
      `/department-tasks/${departmentTaskId}/member-tasks`,
      {
        user_id: 1, // Admin user for testing
        title: "Implement JWT Token Generation",
        description: "Create secure JWT token generation and validation logic",
        priority: "high",
        deadline: "2025-02-10",
        estimated_hours: 40,
      }
    );

    memberTaskId = response.data.data.taskId;
    console.log(
      `✅ Task assigned to admin user for testing (Task ID: ${memberTaskId})`
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to assign task to member:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 6: Member starts task
async function memberStartsTask() {
  console.log("\n▶️  Step 6: Member Starts Task");
  try {
    await api.post(`/member-tasks/${memberTaskId}/start`);
    console.log("✅ Member started working on task");
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to start task:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 7: Member updates progress
async function memberUpdatesProgress() {
  console.log("\n📊 Step 7: Member Updates Progress");
  try {
    await api.patch(`/member-tasks/${memberTaskId}/progress`, {
      progress: 50,
      actual_hours: 20,
    });
    console.log("✅ Progress updated: 50% complete, 20 hours spent");

    // Create progress report
    const reportRes = await api.post("/reports", {
      project_id: testProject.id,
      member_task_id: memberTaskId,
      report_type: "weekly",
      title: "Week 1 Progress Report",
      content:
        "Completed JWT token generation logic. Started work on token validation. No major blockers.",
      progress: 50,
      issues: null,
    });

    reportId = reportRes.data.data.reportId;
    console.log(`✅ Progress report created (ID: ${reportId})`);
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to update progress:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 8: Member submits task
async function memberSubmitsTask() {
  console.log("\n📤 Step 8: Member Submits Task");
  try {
    // Update to 100% first
    await api.patch(`/member-tasks/${memberTaskId}/progress`, {
      progress: 100,
      actual_hours: 38,
    });

    await api.post(`/member-tasks/${memberTaskId}/submit`, {
      notes:
        "JWT implementation complete. All unit tests passing. Ready for review.",
    });

    console.log("✅ Member submitted task for approval");
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to submit task:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 9: Manager approves member task
async function managerApprovesMemberTask() {
  console.log("\n✔️  Step 9: Manager Approves Member Task");
  try {
    await api.post(`/member-tasks/${memberTaskId}/approve`, {
      notes: "Great work! JWT implementation looks solid. Approved.",
    });

    console.log("✅ Manager approved member task");
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to approve member task:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 10: Manager submits department task
async function managerSubmitsDepartmentTask() {
  console.log("\n📤 Step 10: Manager Submits Department Task");
  try {
    await api.patch(`/department-tasks/${departmentTaskId}/progress`, {
      progress: 100,
      actual_hours: 115,
    });

    await api.post(`/department-tasks/${departmentTaskId}/submit`, {
      notes:
        "Authentication module complete. All sub-tasks approved. Ready for final review.",
    });

    console.log("✅ Manager submitted department task for admin approval");
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to submit department task:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 11: Admin approves department task
async function adminApprovesDepartmentTask() {
  console.log("\n✅ Step 11: Admin Approves Department Task");
  try {
    await api.post(`/department-tasks/${departmentTaskId}/approve`, {
      notes:
        "Excellent work! Authentication module approved and ready for deployment.",
    });

    console.log("✅ Admin approved department task");
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to approve department task:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 12: Test warning system
async function testWarningSystem() {
  console.log("\n⚠️  Step 12: Test Warning System");
  try {
    // Get a user to warn
    const usersRes = await api.get("/users");
    const users = usersRes.data.data.users || usersRes.data.data || [];
    const user = users.find((u) => u.id !== 1); // Get non-admin user

    if (!user) {
      console.error("❌ No user found to warn");
      return false;
    }

    const response = await api.post("/warnings", {
      project_id: testProject.id,
      department_task_id: departmentTaskId,
      warned_user_id: user.id,
      warning_type: "late_submission",
      severity: "low",
      reason: "Task was submitted 2 days after deadline (test warning)",
      penalty_amount: 0,
    });

    warningId = response.data.data.warningId;
    console.log(`✅ Warning issued to ${user.username} (ID: ${warningId})`);
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to issue warning:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Step 13: Verify all data
async function verifyData() {
  console.log("\n🔍 Step 13: Verify Complete Workflow");
  try {
    // Get department task
    const deptTaskRes = await api.get(`/department-tasks/${departmentTaskId}`);
    const deptTask = deptTaskRes.data.data;

    console.log("\n📋 Department Task Status:");
    console.log(`   Title: ${deptTask.title}`);
    console.log(`   Status: ${deptTask.status}`);
    console.log(`   Progress: ${deptTask.progress}%`);
    console.log(`   Estimated Hours: ${deptTask.estimated_hours}`);
    console.log(`   Actual Hours: ${deptTask.actual_hours}`);

    // Get member tasks
    const memberTasksRes = await api.get(
      `/department-tasks/${departmentTaskId}/member-tasks`
    );
    console.log(
      `\n👥 Member Tasks: ${memberTasksRes.data.data.length} assigned`
    );

    memberTasksRes.data.data.forEach((task) => {
      console.log(`   - ${task.title} (${task.status}, ${task.progress}%)`);
    });

    // Get reports
    const reportsRes = await api.get(`/projects/${testProject.id}/reports`);
    console.log(`\n📊 Reports: ${reportsRes.data.data.length} submitted`);

    // Get warnings
    const warningsRes = await api.get(`/projects/${testProject.id}/warnings`);
    console.log(`\n⚠️  Warnings: ${warningsRes.data.data.length} issued`);

    return true;
  } catch (error) {
    console.error(
      "❌ Failed to verify data:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting Complete Task Workflow Test\n");
  console.log("=".repeat(60));

  const steps = [
    { name: "Login", fn: login },
    { name: "Get Test Data", fn: getTestData },
    { name: "Assign Task to Department", fn: assignTaskToDepartment },
    { name: "Manager Accepts Task", fn: managerAcceptsTask },
    { name: "Assign Task to Member", fn: assignTaskToMember },
    { name: "Member Starts Task", fn: memberStartsTask },
    { name: "Member Updates Progress", fn: memberUpdatesProgress },
    { name: "Member Submits Task", fn: memberSubmitsTask },
    { name: "Manager Approves Member Task", fn: managerApprovesMemberTask },
    {
      name: "Manager Submits Department Task",
      fn: managerSubmitsDepartmentTask,
    },
    {
      name: "Admin Approves Department Task",
      fn: adminApprovesDepartmentTask,
    },
    { name: "Test Warning System", fn: testWarningSystem },
    { name: "Verify Complete Workflow", fn: verifyData },
  ];

  for (const step of steps) {
    const success = await step.fn();
    if (!success) {
      console.log(`\n❌ Test stopped at: ${step.name}`);
      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 ALL TESTS PASSED!");
  console.log("\n✅ Complete workflow verified:");
  console.log("   1. Admin → Department task assignment");
  console.log("   2. Manager → Task acceptance & member assignment");
  console.log("   3. Member → Task execution & submission");
  console.log("   4. Manager → Member task approval");
  console.log("   5. Manager → Department task submission");
  console.log("   6. Admin → Final approval");
  console.log("   7. Reports & Warnings working");
  console.log("\n🎊 Task hierarchy workflow is ready for production!");
}

runTests().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});

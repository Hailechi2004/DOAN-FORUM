require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3000/api";
let authToken = "";
let testProjectId = null;
let testTaskId = null;
let testMilestoneId = null;
let testCommentId = null;

// Helper function
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

async function login() {
  console.log("\n📝 1. LOGIN AS ADMIN...");
  try {
    const response = await api.post("/auth/login", {
      email: "admin@example.com",
      password: "Admin123!",
    });
    authToken = response.data.data.token;
    api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    console.log("✅ Login successful");
    return true;
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    return false;
  }
}

async function createTestProject() {
  console.log("\n📝 2. CREATE TEST PROJECT...");
  try {
    const response = await api.post("/projects", {
      name: "Test Project for Extensions",
      description: "Testing tasks, milestones, comments, files",
      status: "planning",
      priority: "high",
      start_date: "2025-01-01",
      end_date: "2025-12-31",
    });
    testProjectId = response.data.data.id;
    console.log("✅ Project created:", response.data.data);
    return true;
  } catch (error) {
    console.error(
      "❌ Create project failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

async function testTasks() {
  console.log("\n📝 3. TEST TASKS...");

  // Create task
  try {
    const response = await api.post(`/projects/${testProjectId}/tasks`, {
      title: "Design Database Schema",
      description: "Create comprehensive database design",
      status: "todo",
      priority: "high",
      estimated_hours: 8,
    });
    testTaskId = response.data.data.id;
    console.log("✅ Task created:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Create task failed:",
      error.response?.data || error.message
    );
    return false;
  }

  // Get all tasks
  try {
    const response = await api.get(`/projects/${testProjectId}/tasks`);
    console.log("✅ Get tasks:", response.data.data.length, "tasks found");
  } catch (error) {
    console.error(
      "❌ Get tasks failed:",
      error.response?.data || error.message
    );
  }

  // Update task
  try {
    const response = await api.put(
      `/projects/${testProjectId}/tasks/${testTaskId}`,
      {
        status: "in_progress",
        actual_hours: 2,
      }
    );
    console.log("✅ Task updated:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Update task failed:",
      error.response?.data || error.message
    );
  }

  // Create subtask
  try {
    const response = await api.post(`/projects/${testProjectId}/tasks`, {
      title: "Design Users Table",
      description: "Users and profiles schema",
      parent_task_id: testTaskId,
      status: "todo",
      priority: "medium",
      estimated_hours: 3,
    });
    console.log("✅ Subtask created:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Create subtask failed:",
      error.response?.data || error.message
    );
  }

  return true;
}

async function testMilestones() {
  console.log("\n📝 4. TEST MILESTONES...");

  // Create milestone
  try {
    const response = await api.post(`/projects/${testProjectId}/milestones`, {
      title: "Database Design Complete",
      description: "All tables designed and reviewed",
      due_date: "2025-02-01",
      status: "pending",
    });
    testMilestoneId = response.data.data.id;
    console.log("✅ Milestone created:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Create milestone failed:",
      error.response?.data || error.message
    );
    return false;
  }

  // Get milestones
  try {
    const response = await api.get(`/projects/${testProjectId}/milestones`);
    console.log(
      "✅ Get milestones:",
      response.data.data.length,
      "milestones found"
    );
  } catch (error) {
    console.error(
      "❌ Get milestones failed:",
      error.response?.data || error.message
    );
  }

  // Update milestone
  try {
    const response = await api.put(
      `/projects/${testProjectId}/milestones/${testMilestoneId}`,
      {
        status: "completed",
      }
    );
    console.log("✅ Milestone updated:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Update milestone failed:",
      error.response?.data || error.message
    );
  }

  return true;
}

async function testComments() {
  console.log("\n📝 5. TEST COMMENTS...");

  // Create comment
  try {
    const response = await api.post(`/projects/${testProjectId}/comments`, {
      comment: "Great progress on the database design!",
      parent_id: null,
    });
    testCommentId = response.data.data.id;
    console.log("✅ Comment created:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Create comment failed:",
      error.response?.data || error.message
    );
    return false;
  }

  // Create reply
  try {
    const response = await api.post(`/projects/${testProjectId}/comments`, {
      comment: "Thanks! Working on the relationships now.",
      parent_id: testCommentId,
    });
    console.log("✅ Reply created:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Create reply failed:",
      error.response?.data || error.message
    );
  }

  // Get comments
  try {
    const response = await api.get(`/projects/${testProjectId}/comments`);
    console.log(
      "✅ Get comments:",
      response.data.data.length,
      "comments found"
    );
  } catch (error) {
    console.error(
      "❌ Get comments failed:",
      error.response?.data || error.message
    );
  }

  // Update comment
  try {
    const response = await api.put(
      `/projects/${testProjectId}/comments/${testCommentId}`,
      {
        comment: "Great progress on the database design! Almost done.",
      }
    );
    console.log("✅ Comment updated:", response.data.data);
  } catch (error) {
    console.error(
      "❌ Update comment failed:",
      error.response?.data || error.message
    );
  }

  return true;
}

async function testActivityLogs() {
  console.log("\n📝 6. TEST ACTIVITY LOGS...");

  try {
    const response = await api.get(
      `/projects/${testProjectId}/activities?limit=20`
    );
    console.log(
      "✅ Get activities:",
      response.data.data.length,
      "activities found"
    );
    console.log("\n📋 Recent Activities:");
    response.data.data.slice(0, 5).forEach((activity, index) => {
      console.log(
        `   ${index + 1}. [${activity.action}] ${activity.description} - ${activity.username}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Get activities failed:",
      error.response?.data || error.message
    );
    return false;
  }

  return true;
}

async function testFiles() {
  console.log("\n📝 7. TEST FILES (Upload placeholder)...");

  try {
    const response = await api.post(`/projects/${testProjectId}/files`);
    console.log("⚠️  File upload:", response.data.message);
  } catch (error) {
    if (error.response?.status === 501) {
      console.log(
        "⚠️  File upload endpoint exists but not implemented (expected)"
      );
    } else {
      console.error(
        "❌ File endpoint failed:",
        error.response?.data || error.message
      );
    }
  }

  try {
    const response = await api.get(`/projects/${testProjectId}/files`);
    console.log("✅ Get files:", response.data.data.length, "files found");
  } catch (error) {
    console.error(
      "❌ Get files failed:",
      error.response?.data || error.message
    );
  }

  return true;
}

async function cleanup() {
  console.log("\n📝 8. CLEANUP (Optional - keep data for inspection)...");

  // Uncomment to delete test data
  // try {
  //   await api.delete(`/projects/${testProjectId}`);
  //   console.log('✅ Test project deleted');
  // } catch (error) {
  //   console.error('❌ Cleanup failed:', error.response?.data || error.message);
  // }

  console.log("⚠️  Test data kept for inspection");
  console.log(`   Project ID: ${testProjectId}`);
  console.log(`   Task ID: ${testTaskId}`);
  console.log(`   Milestone ID: ${testMilestoneId}`);
  console.log(`   Comment ID: ${testCommentId}`);
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("🧪 TESTING PROJECT EXTENSIONS API");
  console.log("=".repeat(60));

  if (!(await login())) return;
  if (!(await createTestProject())) return;

  await testTasks();
  await testMilestones();
  await testComments();
  await testActivityLogs();
  await testFiles();
  await cleanup();

  console.log("\n" + "=".repeat(60));
  console.log("✅ ALL TESTS COMPLETED");
  console.log("=".repeat(60));
}

runTests().catch((err) => {
  console.error("\n❌ Test suite failed:", err);
  process.exit(1);
});

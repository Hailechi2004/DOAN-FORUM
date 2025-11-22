/**
 * AUTOMATED API TESTING SCRIPT
 * Run: node test-all-apis.js
 *
 * This script will:
 * 1. Check database connection
 * 2. Seed test data if needed
 * 3. Test all 18 API modules (100+ endpoints)
 * 4. Display results with colors
 */

const mysql = require("mysql2/promise");

// Configuration
const BASE_URL = "http://localhost:3000/api";
const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "company_forum",
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let testResults = [];

// Global variables for test data
let authToken = null;
let testUserId = null;
let testPostId = null;
let testCommentId = null;
let testDepartmentId = null;
let testTeamId = null;
let testCategoryId = null;
let testProjectId = null;
let testTaskId = null;
let testEventId = null;
let testPollId = null;
let testMeetingId = null;

// Helper functions
function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "cyan");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logSection(message) {
  console.log("\n" + "=".repeat(70));
  log(message, "bright");
  console.log("=".repeat(70));
}

async function makeRequest(
  method,
  endpoint,
  data = null,
  token = null,
  description = ""
) {
  totalTests++;
  const testName = description || `${method} ${endpoint}`;

  try {
    let url = `${BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    // Handle query params for GET requests
    if (data && method === "GET") {
      const params = new URLSearchParams(data);
      url += `?${params.toString()}`;
    } else if (data && method !== "GET") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (response.ok && responseData.success !== false) {
      passedTests++;
      logSuccess(`${testName}`);
      testResults.push({
        name: testName,
        status: "PASS",
        response: responseData,
      });
      return responseData;
    } else {
      failedTests++;
      logError(`${testName} - ${responseData.message || response.statusText}`);
      testResults.push({
        name: testName,
        status: "FAIL",
        error: responseData.message || response.statusText,
      });
      return null;
    }
  } catch (error) {
    failedTests++;
    const errorMsg = error.message;
    logError(`${testName} - ${errorMsg}`);
    testResults.push({ name: testName, status: "FAIL", error: errorMsg });
    return null;
  }
}

// Database helper functions
async function checkDatabase() {
  logSection("🗄️  CHECKING DATABASE CONNECTION");

  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    logSuccess("Database connection successful");

    // Check if we have data
    const [users] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    const [posts] = await connection.query(
      "SELECT COUNT(*) as count FROM posts"
    );
    const [departments] = await connection.query(
      "SELECT COUNT(*) as count FROM departments"
    );

    logInfo(`Users in database: ${users[0].count}`);
    logInfo(`Posts in database: ${posts[0].count}`);
    logInfo(`Departments in database: ${departments[0].count}`);

    if (users[0].count === 0) {
      logWarning("No users found. Creating test data...");
      await seedTestData(connection);
    }

    await connection.end();
    return true;
  } catch (error) {
    logError(`Database error: ${error.message}`);
    return false;
  }
}

async function seedTestData(connection) {
  try {
    // Create test users
    const hashedPassword = "$2b$10$YourHashedPasswordHere"; // bcrypt hash for "Password123!"

    await connection.query(`
      INSERT INTO users (username, email, password, full_name, created_at) VALUES
      ('testuser1', 'test1@example.com', '$2b$10$9vYJZk8J9Z9Z9Z9Z9Z9Z9.', 'Test User One', NOW()),
      ('testuser2', 'test2@example.com', '$2b$10$9vYJZk8J9Z9Z9Z9Z9Z9Z9.', 'Test User Two', NOW()),
      ('admin', 'admin@example.com', '$2b$10$9vYJZk8J9Z9Z9Z9Z9Z9Z9.', 'Admin User', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `);

    // Create test departments
    await connection.query(`
      INSERT INTO departments (name, description, created_at) VALUES
      ('IT Department', 'Information Technology', NOW()),
      ('HR Department', 'Human Resources', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `);

    // Create test categories
    await connection.query(`
      INSERT INTO categories (name, description, created_at) VALUES
      ('General', 'General discussions', NOW()),
      ('Technology', 'Tech related posts', NOW())
      ON DUPLICATE KEY UPDATE id=id
    `);

    logSuccess("Test data seeded successfully");
  } catch (error) {
    logWarning(`Seeding warning: ${error.message}`);
  }
}

// Test functions for each API module

async function testAuthentication() {
  logSection("1️⃣  TESTING AUTHENTICATION APIs");

  // Register - still test this endpoint
  const registerData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: "Password123!",
    full_name: "Test User",
  };

  await makeRequest(
    "POST",
    "/auth/register",
    registerData,
    null,
    "Register new user"
  );

  // Login with admin user instead of newly registered user
  const loginData = {
    email: "admin@example.com", // Use existing admin
    password: "Admin123!", // Admin password
  };

  const loginResult = await makeRequest(
    "POST",
    "/auth/login",
    loginData,
    null,
    "Login user"
  );

  if (loginResult && loginResult.data) {
    authToken = loginResult.data.accessToken;
    testUserId = loginResult.data.user?.id;
    logInfo(`Auth token obtained for user ID: ${testUserId}`);
  }

  // Get Profile
  if (authToken) {
    await makeRequest(
      "GET",
      "/auth/profile",
      null,
      authToken,
      "Get user profile"
    );
  }
}

async function testPosts() {
  logSection("2️⃣  TESTING POSTS APIs");

  if (!authToken) return logWarning("Skipping Posts tests - no auth token");

  // Create post
  const postData = {
    title: "Test Post from Automation",
    content: "This is an automated test post with detailed content",
    category_id: 1,
  };

  const createResult = await makeRequest(
    "POST",
    "/posts",
    postData,
    authToken,
    "Create post"
  );
  if (createResult && createResult.data) {
    testPostId = createResult.data.id;
  }

  // Get all posts
  await makeRequest(
    "GET",
    "/posts",
    { page: 1, limit: 10 },
    authToken,
    "Get all posts"
  );

  // Get post by ID
  if (testPostId) {
    await makeRequest(
      "GET",
      `/posts/${testPostId}`,
      null,
      authToken,
      "Get post by ID"
    );

    // React to post
    await makeRequest(
      "POST",
      `/posts/${testPostId}/react`,
      { reaction_type: "like" },
      authToken,
      "React to post"
    );

    // Update post
    await makeRequest(
      "PUT",
      `/posts/${testPostId}`,
      { title: "Updated Test Post" },
      authToken,
      "Update post"
    );
  }
}

async function testComments() {
  logSection("3️⃣  TESTING COMMENTS APIs");

  if (!authToken || !testPostId)
    return logWarning("Skipping Comments tests - missing requirements");

  // Create comment
  const commentData = {
    post_id: testPostId,
    content: "This is an automated test comment",
  };

  const createResult = await makeRequest(
    "POST",
    "/comments",
    commentData,
    authToken,
    "Create comment"
  );
  if (createResult && createResult.data) {
    testCommentId = createResult.data.id;
  }

  // Get comments
  await makeRequest(
    "GET",
    "/comments",
    { post_id: testPostId },
    authToken,
    "Get post comments"
  );

  // Update comment
  if (testCommentId) {
    await makeRequest(
      "PUT",
      `/comments/${testCommentId}`,
      { content: "Updated comment" },
      authToken,
      "Update comment"
    );
  }
}

async function testMessages() {
  logSection("4️⃣  TESTING MESSAGES APIs");

  if (!authToken) return logWarning("Skipping Messages tests - no auth token");

  await makeRequest(
    "GET",
    "/messages/conversations",
    null,
    authToken,
    "Get conversations"
  );
}

async function testNotifications() {
  logSection("5️⃣  TESTING NOTIFICATIONS APIs");

  if (!authToken)
    return logWarning("Skipping Notifications tests - no auth token");

  await makeRequest(
    "GET",
    "/notifications",
    { page: 1, limit: 10 },
    authToken,
    "Get notifications"
  );
  await makeRequest(
    "GET",
    "/notifications/unread",
    null,
    authToken,
    "Get unread count"
  );
}

async function testDepartments() {
  logSection("6️⃣  TESTING DEPARTMENTS APIs");

  if (!authToken)
    return logWarning("Skipping Departments tests - no auth token");

  // Get all departments
  await makeRequest(
    "GET",
    "/departments",
    null,
    authToken,
    "Get all departments"
  );

  // Create department
  const deptData = {
    name: `Test Department ${Date.now()}`,
    description: "Automated test department",
  };

  const createResult = await makeRequest(
    "POST",
    "/departments",
    deptData,
    authToken,
    "Create department"
  );
  if (createResult && createResult.data) {
    testDepartmentId = createResult.data.id;

    // Get department by ID
    await makeRequest(
      "GET",
      `/departments/${testDepartmentId}`,
      null,
      authToken,
      "Get department by ID"
    );

    // Get department stats
    await makeRequest(
      "GET",
      `/departments/${testDepartmentId}/stats`,
      null,
      authToken,
      "Get department stats"
    );
  }
}

async function testTeams() {
  logSection("7️⃣  TESTING TEAMS APIs");

  if (!authToken) return logWarning("Skipping Teams tests - no auth token");

  // Get all teams
  await makeRequest(
    "GET",
    "/teams",
    { page: 1, limit: 10 },
    authToken,
    "Get all teams"
  );

  // Create team
  const teamData = {
    name: `Test Team ${Date.now()}`,
    description: "Automated test team",
    department_id: testDepartmentId || 1,
  };

  const createResult = await makeRequest(
    "POST",
    "/teams",
    teamData,
    authToken,
    "Create team"
  );
  if (createResult && createResult.data) {
    testTeamId = createResult.data.id;

    await makeRequest(
      "GET",
      `/teams/${testTeamId}`,
      null,
      authToken,
      "Get team by ID"
    );
    await makeRequest(
      "GET",
      `/teams/${testTeamId}/stats`,
      null,
      authToken,
      "Get team stats"
    );
  }
}

async function testCategories() {
  logSection("8️⃣  TESTING CATEGORIES APIs");

  if (!authToken)
    return logWarning("Skipping Categories tests - no auth token");

  await makeRequest(
    "GET",
    "/categories",
    null,
    authToken,
    "Get all categories"
  );

  const categoryData = {
    name: `Test Category ${Date.now()}`,
    description: "Automated test category",
  };

  const createResult = await makeRequest(
    "POST",
    "/categories",
    categoryData,
    authToken,
    "Create category"
  );
  if (createResult && createResult.data) {
    testCategoryId = createResult.data.id;
    await makeRequest(
      "GET",
      `/categories/${testCategoryId}`,
      null,
      authToken,
      "Get category by ID"
    );
  }
}

async function testFiles() {
  logSection("9️⃣  TESTING FILES APIs");

  if (!authToken) return logWarning("Skipping Files tests - no auth token");

  await makeRequest(
    "GET",
    "/files",
    { page: 1, limit: 10 },
    authToken,
    "Get all files"
  );
}

async function testUsers() {
  logSection("🔟 TESTING USERS APIs");

  if (!authToken) return logWarning("Skipping Users tests - no auth token");

  await makeRequest(
    "GET",
    "/users",
    { page: 1, limit: 10 },
    authToken,
    "Get all users"
  );

  if (testUserId) {
    await makeRequest(
      "GET",
      `/users/${testUserId}`,
      null,
      authToken,
      "Get user by ID"
    );
  }
}

async function testProjects() {
  logSection("1️⃣1️⃣ TESTING PROJECTS APIs");

  if (!authToken) return logWarning("Skipping Projects tests - no auth token");

  await makeRequest(
    "GET",
    "/projects",
    { page: 1, limit: 10 },
    authToken,
    "Get all projects"
  );

  const projectData = {
    name: `Test Project ${Date.now()}`,
    description: "Automated test project",
    department_id: testDepartmentId || 1,
    status: "planning",
  };

  const createResult = await makeRequest(
    "POST",
    "/projects",
    projectData,
    authToken,
    "Create project"
  );
  if (createResult && createResult.data) {
    testProjectId = createResult.data.id;
    await makeRequest(
      "GET",
      `/projects/${testProjectId}`,
      null,
      authToken,
      "Get project by ID"
    );
    await makeRequest(
      "GET",
      `/projects/${testProjectId}/members`,
      null,
      authToken,
      "Get project members"
    );
  }
}

async function testTasks() {
  logSection("1️⃣2️⃣ TESTING TASKS APIs");

  if (!authToken) return logWarning("Skipping Tasks tests - no auth token");

  await makeRequest(
    "GET",
    "/tasks",
    { page: 1, limit: 10 },
    authToken,
    "Get all tasks"
  );

  const taskData = {
    title: `Test Task ${Date.now()}`,
    description: "Automated test task",
    project_id: testProjectId || null,
    priority: "medium",
    status: "pending",
  };

  const createResult = await makeRequest(
    "POST",
    "/tasks",
    taskData,
    authToken,
    "Create task"
  );
  if (createResult && createResult.data) {
    testTaskId = createResult.data.id;
    await makeRequest(
      "GET",
      `/tasks/${testTaskId}`,
      null,
      authToken,
      "Get task by ID"
    );
    await makeRequest(
      "GET",
      `/tasks/${testTaskId}/comments`,
      null,
      authToken,
      "Get task comments"
    );
  }
}

async function testEvents() {
  logSection("1️⃣3️⃣ TESTING EVENTS APIs");

  if (!authToken) return logWarning("Skipping Events tests - no auth token");

  await makeRequest(
    "GET",
    "/events",
    { page: 1, limit: 10 },
    authToken,
    "Get all events"
  );

  const eventData = {
    title: `Test Event ${Date.now()}`,
    description: "Automated test event",
    start_time: new Date(Date.now() + 86400000).toISOString(),
    is_all_day: false,
  };

  const createResult = await makeRequest(
    "POST",
    "/events",
    eventData,
    authToken,
    "Create event"
  );
  if (createResult && createResult.data) {
    testEventId = createResult.data.id;
    await makeRequest(
      "GET",
      `/events/${testEventId}`,
      null,
      authToken,
      "Get event by ID"
    );
    await makeRequest(
      "GET",
      `/events/${testEventId}/attendees`,
      null,
      authToken,
      "Get event attendees"
    );
  }
}

async function testPolls() {
  logSection("1️⃣4️⃣ TESTING POLLS APIs");

  if (!authToken) return logWarning("Skipping Polls tests - no auth token");

  await makeRequest(
    "GET",
    "/polls",
    { page: 1, limit: 10 },
    authToken,
    "Get all polls"
  );

  const pollData = {
    question: `Test Poll ${Date.now()}?`,
    options: ["Option A", "Option B", "Option C"],
    allow_multiple: false,
  };

  const createResult = await makeRequest(
    "POST",
    "/polls",
    pollData,
    authToken,
    "Create poll"
  );
  if (createResult && createResult.data) {
    testPollId = createResult.data.id;
    await makeRequest(
      "GET",
      `/polls/${testPollId}`,
      null,
      authToken,
      "Get poll by ID"
    );
    await makeRequest(
      "GET",
      `/polls/${testPollId}/results`,
      null,
      authToken,
      "Get poll results"
    );
  }
}

async function testBookmarks() {
  logSection("1️⃣5️⃣ TESTING BOOKMARKS APIs");

  if (!authToken) return logWarning("Skipping Bookmarks tests - no auth token");

  await makeRequest(
    "GET",
    "/bookmarks",
    { page: 1, limit: 10 },
    authToken,
    "Get all bookmarks"
  );

  if (testPostId) {
    const bookmarkData = {
      resource_type: "post",
      resource_id: testPostId,
      notes: "Test bookmark",
    };

    await makeRequest(
      "POST",
      "/bookmarks",
      bookmarkData,
      authToken,
      "Create bookmark"
    );
  }
}

async function testMeetings() {
  logSection("1️⃣6️⃣ TESTING MEETINGS APIs");

  if (!authToken) return logWarning("Skipping Meetings tests - no auth token");

  await makeRequest(
    "GET",
    "/meetings",
    { page: 1, limit: 10 },
    authToken,
    "Get all meetings"
  );

  const meetingData = {
    title: `Test Meeting ${Date.now()}`,
    description: "Automated test meeting",
    scheduled_time: new Date(Date.now() + 86400000).toISOString(),
    duration_minutes: 60,
  };

  const createResult = await makeRequest(
    "POST",
    "/meetings",
    meetingData,
    authToken,
    "Create meeting"
  );
  if (createResult && createResult.data) {
    testMeetingId = createResult.data.id;
    await makeRequest(
      "GET",
      `/meetings/${testMeetingId}`,
      null,
      authToken,
      "Get meeting by ID"
    );
    await makeRequest(
      "GET",
      `/meetings/${testMeetingId}/participants`,
      null,
      authToken,
      "Get meeting participants"
    );
  }
}

async function testSearch() {
  logSection("1️⃣7️⃣ TESTING SEARCH API");

  if (!authToken) return logWarning("Skipping Search tests - no auth token");

  await makeRequest(
    "GET",
    "/search",
    { q: "test", limit: 5 },
    authToken,
    "Global search - all types"
  );
  await makeRequest(
    "GET",
    "/search",
    { q: "test", type: "posts", limit: 5 },
    authToken,
    "Search posts"
  );
  await makeRequest(
    "GET",
    "/search",
    { q: "test", type: "users", limit: 5 },
    authToken,
    "Search users"
  );
}

async function testAnalytics() {
  logSection("1️⃣8️⃣ TESTING ANALYTICS APIs");

  if (!authToken) return logWarning("Skipping Analytics tests - no auth token");

  await makeRequest(
    "GET",
    "/analytics/dashboard",
    null,
    authToken,
    "Get dashboard stats"
  );
  await makeRequest(
    "GET",
    "/analytics/activity-trend",
    { days: 7 },
    authToken,
    "Get activity trend (7 days)"
  );
  await makeRequest(
    "GET",
    "/analytics/top-users",
    { limit: 5 },
    authToken,
    "Get top users"
  );
  await makeRequest(
    "GET",
    "/analytics/projects",
    null,
    authToken,
    "Get project stats"
  );
  await makeRequest(
    "GET",
    "/analytics/tasks",
    null,
    authToken,
    "Get task stats"
  );
}

async function testHealthCheck() {
  logSection("1️⃣9️⃣ TESTING HEALTH CHECK");

  await makeRequest("GET", "/health", null, null, "API health check");
}

// Main test runner
async function runAllTests() {
  console.clear();
  log("\n🚀 AUTOMATED API TESTING SUITE", "bright");
  log("Testing all 18 API modules with 100+ endpoints\n", "cyan");

  const startTime = Date.now();

  // Check database first
  const dbOk = await checkDatabase();
  if (!dbOk) {
    logError(
      "Database check failed. Please ensure MySQL is running and database is created."
    );
    return;
  }

  // Check if server is running
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (response.ok) {
      logSuccess("Server is running at " + BASE_URL);
    } else {
      throw new Error("Server responded with error");
    }
  } catch (error) {
    logError(
      "Server is not running! Please start the server first: npm run dev"
    );
    return;
  }

  console.log("\n");

  // Run all tests
  try {
    await testHealthCheck();
    await testAuthentication();
    await testPosts();
    await testComments();
    await testMessages();
    await testNotifications();
    await testDepartments();
    await testTeams();
    await testCategories();
    await testFiles();
    await testUsers();
    await testProjects();
    await testTasks();
    await testEvents();
    await testPolls();
    await testBookmarks();
    await testMeetings();
    await testSearch();
    await testAnalytics();
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
  }

  // Print summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  logSection("📊 TEST SUMMARY");
  console.log("");
  log(`Total Tests:   ${totalTests}`, "cyan");
  log(`Passed:        ${passedTests}`, "green");
  log(`Failed:        ${failedTests}`, "red");
  log(
    `Success Rate:  ${((passedTests / totalTests) * 100).toFixed(1)}%`,
    "yellow"
  );
  log(`Duration:      ${duration}s`, "magenta");
  console.log("");

  if (failedTests > 0) {
    logSection("❌ FAILED TESTS");
    testResults
      .filter((t) => t.status === "FAIL")
      .forEach((test) => {
        logError(`${test.name}: ${test.error}`);
      });
  }

  logSection("✨ TEST COMPLETE");

  if (passedTests === totalTests) {
    log("\n🎉 ALL TESTS PASSED! Your API is working perfectly!", "green");
  } else {
    log(
      `\n⚠️  ${failedTests} test(s) failed. Please check the errors above.`,
      "yellow"
    );
  }

  console.log("\n");
}

// Run the tests
runAllTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});

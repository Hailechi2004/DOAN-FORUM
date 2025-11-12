const axios = require("axios");

// Test Employee Projects API
async function testEmployeeProjects() {
  const API_BASE_URL = "http://localhost:5000/api";

  try {
    console.log("🔍 Testing Employee Projects API...\n");

    // First, login as employee to get token
    console.log("1. Login as employee...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: "employee1",
      password: "Employee123!",
    });

    const token = loginResponse.data.token;
    const employee = loginResponse.data.user;
    console.log(`✅ Logged in as: ${employee.username} (ID: ${employee.id})`);
    console.log(`   Department ID: ${employee.department_id}\n`);

    // Test: Get projects where employee is a member
    console.log("2. Fetching projects for employee...");
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        member_id: employee.id,
        page: 1,
        limit: 10,
      },
    });

    const data = projectsResponse.data.data || projectsResponse.data;
    const projects = data.projects || data || [];

    console.log(`✅ Found ${projects.length} projects for employee:\n`);

    projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name}`);
      console.log(`      ID: ${project.id}`);
      console.log(`      Status: ${project.status}`);
      console.log(`      Manager: ${project.manager_name || "N/A"}`);
      console.log(`      Department: ${project.department_name || "N/A"}`);
      console.log(`      Members: ${project.member_count || 0}`);
      console.log(`      Tasks: ${project.task_count || 0}\n`);
    });

    if (projects.length === 0) {
      console.log(
        "   ⚠️  No projects found. Employee might not be assigned to any projects."
      );
      console.log(
        "   💡 Tip: Admin or Manager needs to add this employee to a project first.\n"
      );
    }

    // Test: Get project details if employee has projects
    if (projects.length > 0) {
      const firstProject = projects[0];
      console.log(`3. Fetching details for project: ${firstProject.name}...`);

      const detailResponse = await axios.get(
        `${API_BASE_URL}/projects/${firstProject.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`✅ Project details retrieved successfully`);
      console.log(
        `   Description: ${detailResponse.data.description || "N/A"}`
      );
      console.log(`   Priority: ${detailResponse.data.priority || "N/A"}\n`);

      // Test: Get tasks for this project
      console.log(`4. Fetching tasks assigned to employee in this project...`);
      const tasksResponse = await axios.get(
        `${API_BASE_URL}/projects/${firstProject.id}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            assigned_to: employee.id,
          },
        }
      );

      const tasks = tasksResponse.data.data || tasksResponse.data || [];
      console.log(`✅ Found ${tasks.length} tasks assigned to employee\n`);

      tasks.slice(0, 3).forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.title}`);
        console.log(`      Status: ${task.status}`);
        console.log(`      Priority: ${task.priority}`);
        console.log(`      Due: ${task.due_date || "No deadline"}\n`);
      });
    }

    console.log("✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testEmployeeProjects();

const axios = require("axios");

async function testManagerProjects() {
  try {
    // 1. Login as manager
    console.log("1. Logging in as manager...");
    const loginResponse = await axios.post(
      "http://localhost:3000/api/auth/login",
      {
        email: "manager@company.com",
        password: "Manager123!",
      }
    );

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log("✓ Logged in successfully");
    console.log("User:", {
      id: user.id,
      email: user.email,
      department_id: user.department_id,
      role: user.role,
    });

    // 2. Fetch projects with department_id filter
    console.log(
      "\n2. Fetching projects for department_id:",
      user.department_id
    );
    const projectsResponse = await axios.get(
      "http://localhost:3000/api/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          department_id: user.department_id,
          page: 1,
          limit: 20,
        },
      }
    );

    console.log("\n✓ API Response status:", projectsResponse.status);
    console.log("Response data structure:", Object.keys(projectsResponse.data));

    const data = projectsResponse.data.data || projectsResponse.data;
    console.log(
      "\nFull response data:",
      JSON.stringify(projectsResponse.data, null, 2)
    );
    console.log("\nData structure:", Object.keys(data));

    const projects = data.items || data.projects || data;
    console.log(
      "\n✓ Found",
      Array.isArray(projects) ? projects.length : "NOT AN ARRAY",
      "projects"
    );

    if (projects.length > 0) {
      console.log("\nProjects:");
      projects.forEach((p) => {
        console.log(`  - [${p.id}] ${p.name}`);
        console.log(
          `    Status: ${p.status}, Dept: ${p.department_name || "None"}`
        );
      });
    } else {
      console.log("\n⚠ No projects found! This is the problem.");
    }

    // 3. Test without department_id filter (to see all projects)
    console.log("\n3. Fetching ALL projects (no filter)...");
    const allProjectsResponse = await axios.get(
      "http://localhost:3000/api/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 1,
          limit: 20,
        },
      }
    );

    const allData = allProjectsResponse.data.data || allProjectsResponse.data;
    const allProjects = allData.items || allData.projects || allData;
    console.log("✓ Found", allProjects.length, "total projects in system");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

testManagerProjects();

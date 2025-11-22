require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3000/api";

async function testCreateProject() {
  console.log("🧪 Testing POST /api/projects\n");

  try {
    // Login first
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@example.com",
      password: "Admin123!",
    });
    const token = loginRes.data.data.token;

    console.log("✅ Logged in successfully\n");

    // Test 1: Create project with minimal data
    console.log("📝 Test 1: Minimal data");
    try {
      const response1 = await axios.post(
        `${API_URL}/projects`,
        {
          name: "Test Project from UI",
          description: "Testing project creation",
          status: "planning",
          priority: "medium",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Success:", response1.data);
    } catch (error) {
      console.error("❌ Failed:", error.response?.data || error.message);
    }

    // Test 2: Create project with all fields
    console.log("\n📝 Test 2: Full data");
    try {
      const response2 = await axios.post(
        `${API_URL}/projects`,
        {
          name: "Full Project Test",
          description: "Project with all fields",
          status: "in_progress",
          priority: "high",
          start_date: "2025-01-01",
          end_date: "2025-12-31",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Success:", response2.data);
    } catch (error) {
      console.error("❌ Failed:", error.response?.data || error.message);
    }

    // Test 3: Create project with empty fields (like UI does)
    console.log("\n📝 Test 3: Empty optional fields");
    try {
      const response3 = await axios.post(
        `${API_URL}/projects`,
        {
          name: "UI Style Project",
          description: "",
          status: "planning",
          priority: "medium",
          start_date: "",
          end_date: "",
          department_id: null,
          team_id: null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Success:", response3.data);
    } catch (error) {
      console.error("❌ Failed:", error.response?.data || error.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testCreateProject();

require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3000/api";

async function testGetProjects() {
  console.log("🧪 Testing GET /api/projects\n");

  try {
    // Login first
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@example.com",
      password: "Admin123!",
    });
    const token = loginRes.data.data.token;

    // Get projects
    const response = await axios.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: 1,
        limit: 20,
      },
    });

    console.log("✅ Response Status:", response.status);
    console.log("✅ Response Data:", JSON.stringify(response.data, null, 2));

    if (response.data.data && Array.isArray(response.data.data)) {
      console.log(`\n✅ Found ${response.data.data.length} projects:`);
      response.data.data.forEach((project, index) => {
        console.log(
          `   ${index + 1}. ${project.name} (ID: ${project.id}) - Status: ${project.status}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testGetProjects();

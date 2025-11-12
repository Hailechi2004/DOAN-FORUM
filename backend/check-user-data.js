const mysql = require("mysql2/promise");

async function checkUserData() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "company_forum",
  });

  try {
    console.log("🔍 Checking user data from database...\n");

    // Get user ID 2 (jane.smith)
    const [users] = await db.execute(
      `SELECT u.*, 
              p.full_name, p.phone, p.avatar_url, p.bio, p.birth_date,
              p.address, p.gender,
              er.employee_code as employee_id,
              er.position,
              er.start_date as hire_date,
              er.department_id,
              er.team_id,
              d.name as department_name, 
              t.name as team_name
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN employee_records er ON u.id = er.user_id AND er.status = 'active'
       LEFT JOIN departments d ON er.department_id = d.id
       LEFT JOIN teams t ON er.team_id = t.id
       WHERE u.username = 'jane.smith' AND u.deleted_at IS NULL`
    );

    if (users.length === 0) {
      console.log("❌ User jane.smith not found");
      return;
    }

    const user = users[0];

    // Get roles
    const [roles] = await db.execute(
      `SELECT r.id, r.name FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );

    user.roles = roles;

    console.log("📊 USER DATA FROM DATABASE:");
    console.log("=".repeat(80));
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Username:", user.username);
    console.log("Full Name:", user.full_name);
    console.log("Phone:", user.phone);
    console.log("Birth Date:", user.birth_date);
    console.log("Gender:", user.gender);
    console.log("Position:", user.position);
    console.log("Employee ID:", user.employee_id);
    console.log("Hire Date:", user.hire_date);
    console.log("Address:", user.address);
    console.log("Department ID:", user.department_id);
    console.log("Department Name:", user.department_name);
    console.log("Team ID:", user.team_id);
    console.log("Team Name:", user.team_name);
    console.log(
      "Roles:",
      roles.map((r) => `${r.name} (ID: ${r.id})`).join(", ")
    );

    console.log("\n📋 Fields that are NULL or empty:");
    const emptyFields = [];
    if (!user.phone) emptyFields.push("phone");
    if (!user.birth_date) emptyFields.push("birth_date");
    if (!user.gender || user.gender === "unspecified")
      emptyFields.push("gender");
    if (!user.position) emptyFields.push("position");
    if (!user.employee_id) emptyFields.push("employee_id");
    if (!user.hire_date) emptyFields.push("hire_date");
    if (!user.address) emptyFields.push("address");
    if (!user.department_id) emptyFields.push("department_id");
    if (!user.team_id) emptyFields.push("team_id");

    if (emptyFields.length > 0) {
      console.log("⚠️  Empty fields:", emptyFields.join(", "));
    } else {
      console.log("✅ All fields have values");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await db.end();
  }
}

checkUserData();

const db = require("./src/config/database");

async function testProfile() {
  try {
    // Get all users
    const [users] = await db.query(
      "SELECT id, email, username FROM users LIMIT 5"
    );
    console.log("\n=== USERS ===");
    console.log(users);

    if (users.length > 0) {
      const userId = users[0].id;
      console.log(`\n=== Testing with user ID: ${userId} ===`);

      // Check if profile exists
      const [profiles] = await db.query(
        "SELECT * FROM profiles WHERE user_id = ?",
        [userId]
      );
      console.log("\n=== PROFILE ===");
      console.log(profiles);

      // Get full user data (like repository does)
      const [fullUser] = await db.query(
        `
        SELECT u.*, p.full_name, p.phone, p.avatar_url, p.bio, p.birth_date,
               p.address, p.gender, d.name as department_name, t.name as team_name
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN employee_records er ON u.id = er.user_id AND er.status = 'active'
        LEFT JOIN departments d ON er.department_id = d.id
        LEFT JOIN teams t ON er.team_id = t.id
        WHERE u.id = ? AND u.deleted_at IS NULL
      `,
        [userId]
      );

      console.log("\n=== FULL USER DATA (Repository result) ===");
      console.log(fullUser[0]);

      // If no profile, create one
      if (profiles.length === 0) {
        console.log("\n=== Creating default profile ===");
        await db.query(
          `INSERT INTO profiles (user_id, full_name, created_at, updated_at) 
           VALUES (?, ?, NOW(), NOW())`,
          [userId, "Test User " + userId]
        );
        console.log("Profile created!");
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testProfile();

const mysql = require("mysql2/promise");

// Database config
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "company_forum",
  charset: "utf8mb4",
};

async function testCommentsAPI() {
  let connection;

  try {
    console.log("🔌 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected!\n");

    // Test 1: Check comments table structure
    console.log("📋 Test 1: Comments table structure");
    console.log("=====================================");
    const [columns] = await connection.query("DESCRIBE comments");
    console.log("Columns:", columns.map((c) => c.Field).join(", "));
    console.log("");

    // Test 2: Get recent comments with user info
    console.log("📋 Test 2: Recent comments with user info");
    console.log("==========================================");
    const [comments] = await connection.query(`
      SELECT 
        c.id,
        c.post_id,
        c.author_id,
        c.content,
        c.created_at,
        u.username as author_name,
        prof.full_name as author_full_name,
        prof.avatar_url as author_avatar_url
      FROM comments c
      JOIN users u ON c.author_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${comments.length} comments:`);
    comments.forEach((comment) => {
      console.log(`\nComment ID: ${comment.id}`);
      console.log(`  Post ID: ${comment.post_id}`);
      console.log(
        `  Author: ${comment.author_full_name || comment.author_name} (ID: ${comment.author_id})`
      );
      console.log(`  Avatar URL: ${comment.author_avatar_url || "null"}`);
      console.log(`  Content: ${comment.content.substring(0, 50)}...`);
      console.log(`  Created: ${comment.created_at}`);
    });
    console.log("");

    // Test 3: Check if posts have comments
    console.log("📋 Test 3: Posts with comment counts");
    console.log("=====================================");
    const [posts] = await connection.query(`
      SELECT 
        p.id,
        p.title,
        COUNT(c.id) as comment_count
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
      GROUP BY p.id
      HAVING comment_count > 0
      ORDER BY comment_count DESC
      LIMIT 5
    `);

    console.log(`Found ${posts.length} posts with comments:`);
    posts.forEach((post) => {
      console.log(`\nPost ID: ${post.id}`);
      console.log(`  Title: ${post.title}`);
      console.log(`  Comments: ${post.comment_count}`);
    });
    console.log("");

    // Test 4: Fetch comments for a specific post (like API does)
    if (posts.length > 0) {
      const testPostId = posts[0].id;
      console.log(
        `📋 Test 4: Fetch comments for Post ID ${testPostId} (API simulation)`
      );
      console.log(
        "================================================================="
      );

      const userId = 2; // Test user ID
      const [postComments] = await connection.query(
        `
        SELECT c.*, u.username as author_name, prof.full_name as author_full_name,
               prof.avatar_url as author_avatar_url,
               (SELECT COUNT(*) FROM reactions WHERE target_type = 'comment' AND target_id = c.id) as total_reactions,
               (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND deleted_at IS NULL) as reply_count,
               (SELECT reaction_type FROM reactions WHERE target_type = 'comment' AND target_id = c.id AND user_id = ?) as user_reaction
        FROM comments c
        JOIN users u ON c.author_id = u.id
        LEFT JOIN profiles prof ON u.id = prof.user_id
        WHERE c.post_id = ? AND c.deleted_at IS NULL
        ORDER BY c.path
      `,
        [userId, testPostId]
      );

      console.log(`Found ${postComments.length} comments for this post:`);
      postComments.forEach((comment) => {
        console.log(`\n  Comment ID: ${comment.id}`);
        console.log(
          `    Author: ${comment.author_full_name || comment.author_name}`
        );
        console.log(`    Avatar: ${comment.author_avatar_url || "null"}`);
        console.log(`    Content: ${comment.content}`);
        console.log(`    Reactions: ${comment.total_reactions}`);
        console.log(`    Replies: ${comment.reply_count}`);
      });
      console.log("");
    }

    // Test 5: Check profiles table
    console.log("📋 Test 5: Check profiles table for avatars");
    console.log("============================================");
    const [profiles] = await connection.query(`
      SELECT user_id, full_name, avatar_url 
      FROM profiles 
      LIMIT 5
    `);

    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach((profile) => {
      console.log(
        `  User ID ${profile.user_id}: ${profile.full_name} - Avatar: ${profile.avatar_url || "null"}`
      );
    });

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

testCommentsAPI();

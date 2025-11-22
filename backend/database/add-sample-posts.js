require("dotenv").config();
const mysql = require("mysql2/promise");

async function addSamplePosts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "company_forum",
    charset: "utf8mb4",
  });

  try {
    // Get admin user
    const [users] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      ["admin@example.com"]
    );
    const adminId = users[0]?.id;

    if (!adminId) {
      console.error("❌ Admin user not found");
      return;
    }

    // Get categories
    const [categories] = await connection.query(
      "SELECT id, code FROM post_categories"
    );
    const categoryMap = {};
    categories.forEach((c) => (categoryMap[c.code] = c.id));

    // Sample posts with Vietnamese content
    const samplePosts = [
      {
        title: "Chào mừng đến với diễn đàn công ty!",
        content:
          "Đây là nơi để chúng ta kết nối, chia sẻ và cùng nhau phát triển. Hãy tham gia tích cực để tạo nên một cộng đồng năng động và thân thiện!",
        category: "announcement",
        visibility: "company",
      },
      {
        title: "Tips để làm việc hiệu quả từ xa",
        content:
          "Trong thời đại số hóa, làm việc từ xa ngày càng phổ biến. Chia sẻ một số mẹo:\n\n1. Tạo không gian làm việc riêng\n2. Lập kế hoạch công việc rõ ràng\n3. Giao tiếp thường xuyên với team\n4. Cân bằng giữa công việc và cuộc sống",
        category: "sharing",
        visibility: "company",
      },
      {
        title: "Đóng góp ý kiến về quy trình làm việc",
        content:
          "Các bạn có ý kiến gì về quy trình làm việc hiện tại? Đâu là điểm mạnh và điểm cần cải thiện? Hãy cùng thảo luận để tìm ra giải pháp tốt nhất!",
        category: "opinion",
        visibility: "company",
      },
      {
        title: "Sự kiện Team Building tháng 11",
        content:
          "Thông báo về sự kiện Team Building:\n\n📅 Thời gian: 15/11/2025\n📍 Địa điểm: Vũng Tàu\n🎯 Mục đích: Gắn kết đội ngũ, thư giãn sau thời gian làm việc\n\nMọi người hãy sắp xếp công việc để tham gia nhé!",
        category: "event",
        visibility: "company",
      },
      {
        title: "Chia sẻ về công nghệ mới",
        content:
          "Mình vừa tìm hiểu về React 19 và thấy có nhiều cải tiến thú vị:\n\n- React Server Components\n- Improved Suspense\n- New Hooks\n\nAi có kinh nghiệm thì chia sẻ thêm nhé!",
        category: "sharing",
        visibility: "company",
      },
    ];

    console.log("📝 Thêm bài viết mẫu...\n");

    for (const post of samplePosts) {
      const categoryId = categoryMap[post.category];

      await connection.query(
        `INSERT INTO posts (author_id, title, content, category_id, visibility)
         VALUES (?, ?, ?, ?, ?)`,
        [adminId, post.title, post.content, categoryId, post.visibility]
      );

      console.log(`✅ Đã thêm: ${post.title}`);
    }

    console.log("\n📊 Tổng kết:");
    const [allPosts] = await connection.query(`
      SELECT p.title, pc.name as category_name, p.created_at
      FROM posts p
      LEFT JOIN post_categories pc ON p.category_id = pc.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    console.log("\nBài viết mới nhất:");
    allPosts.forEach((p) => {
      console.log(`  [${p.category_name || "No Category"}] ${p.title}`);
    });
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    await connection.end();
  }
}

addSamplePosts();

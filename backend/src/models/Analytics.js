const db = require("../config/database");

class Analytics {
  static async getDashboardStats(userId = null, isAdmin = false) {
    const stats = {};

    // Total users
    const [userCount] = await db.query(
      `SELECT COUNT(*) as total FROM users WHERE 1=1`
    );
    stats.totalUsers = userCount[0].total;

    // Active users (logged in last 30 days)
    const [activeUsers] = await db.query(
      `SELECT COUNT(DISTINCT user_id) as total FROM user_sessions WHERE last_activity > DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    stats.activeUsers = activeUsers[0].total;

    // Total posts
    const [postCount] = await db.query(
      `SELECT COUNT(*) as total FROM posts WHERE 1=1`
    );
    stats.totalPosts = postCount[0].total;

    // Posts this month
    const [postsThisMonth] = await db.query(
      `SELECT COUNT(*) as total FROM posts WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') `
    );
    stats.postsThisMonth = postsThisMonth[0].total;

    // Total projects
    const [projectCount] = await db.query(
      `SELECT COUNT(*) as total FROM projects WHERE 1=1`
    );
    stats.totalProjects = projectCount[0].total;

    // Active projects
    const [activeProjects] = await db.query(
      `SELECT COUNT(*) as total FROM projects WHERE status IN ('planning', 'in_progress') `
    );
    stats.activeProjects = activeProjects[0].total;

    // Total tasks
    const [taskCount] = await db.query(
      `SELECT COUNT(*) as total FROM tasks WHERE 1=1`
    );
    stats.totalTasks = taskCount[0].total;

    // Completed tasks
    const [completedTasks] = await db.query(
      `SELECT COUNT(*) as total FROM tasks WHERE status = 'completed' `
    );
    stats.completedTasks = completedTasks[0].total;

    // Departments count
    const [deptCount] = await db.query(
      `SELECT COUNT(*) as total FROM departments WHERE 1=1`
    );
    stats.totalDepartments = deptCount[0].total;

    // Teams count
    const [teamCount] = await db.query(
      `SELECT COUNT(*) as total FROM teams WHERE 1=1`
    );
    stats.totalTeams = teamCount[0].total;

    // Files storage
    const [fileStats] = await db.query(
      `SELECT 
        COUNT(*) as total_files,
        COALESCE(COUNT(*), 0) as total_size,
        0 as total_downloads
       FROM files WHERE 1=1`
    );
    stats.files = fileStats[0];

    return stats;
  }

  static async getActivityTrend(days = 30) {
    const [posts] = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM posts
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    const [tasks] = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM tasks
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    return { posts, tasks };
  }

  static async getTopUsers(limit = 10) {
    const [users] = await db.query(
      `SELECT 
        u.id,
        u.username,
        up.full_name,
        up.avatar_url,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT t.id) as task_count
       FROM users u
       LEFT JOIN profiles up ON u.id = up.user_id
       LEFT JOIN posts p ON u.id = p.author_id AND p.deleted_at IS NULL
       LEFT JOIN comments c ON u.id = c.author_id AND c.deleted_at IS NULL
       LEFT JOIN tasks t ON u.id = t.created_by AND t.is_deleted = FALSE
       WHERE u.deleted_at IS NULL
       GROUP BY u.id
       ORDER BY (post_count + comment_count + task_count) DESC
       LIMIT ?`,
      [limit]
    );

    return users;
  }

  static async getProjectStats() {
    const [stats] = await db.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM projects
       WHERE 1=1
       GROUP BY status`
    );

    return stats;
  }

  static async getTaskStats() {
    const [byStatus] = await db.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM tasks
       WHERE 1=1
       GROUP BY status`
    );

    const [byPriority] = await db.query(
      `SELECT 
        priority,
        COUNT(*) as count
       FROM tasks
       WHERE 1=1
       GROUP BY priority`
    );

    return { byStatus, byPriority };
  }
}

module.exports = Analytics;

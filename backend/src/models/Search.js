const db = require("../config/database");

class Search {
  static async globalSearch(query, filters = {}) {
    const { type, limit = 10 } = filters;
    const searchTerm = `%${query}%`;
    const results = {};

    if (!type || type === "posts") {
      const [posts] = await db.query(
        `SELECT 
          p.id,
          p.title,
          p.content,
          p.created_at,
          up.full_name as author_name,
          'post' as result_type
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
         WHERE (p.title LIKE ? OR p.content LIKE ?) AND p.deleted_at IS NULL
         ORDER BY p.created_at DESC
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.posts = posts;
    }

    if (!type || type === "users") {
      const [users] = await db.query(
        `SELECT 
          u.id,
          u.username,
          up.full_name,
          u.email,
          up.avatar_url,
          up.bio,
          'user' as result_type
         FROM users u
         LEFT JOIN profiles up ON u.id = up.user_id
         WHERE (u.username LIKE ? OR up.full_name LIKE ? OR u.email LIKE ?) AND u.deleted_at IS NULL
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, parseInt(limit)]
      );
      results.users = users;
    }

    if (!type || type === "projects") {
      const [projects] = await db.query(
        `SELECT 
          proj.id,
          proj.name,
          proj.description,
          proj.status,
          proj.created_at,
          up.full_name as manager_name,
          'project' as result_type
         FROM projects proj
         LEFT JOIN users u ON proj.manager_id = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
         WHERE (proj.name LIKE ? OR proj.description LIKE ?) AND proj.is_deleted = FALSE
         ORDER BY proj.created_at DESC
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.projects = projects;
    }

    if (!type || type === "tasks") {
      const [tasks] = await db.query(
        `SELECT 
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.created_at,
          up.full_name as assigned_to_name,
          'task' as result_type
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN profiles up ON u.id = up.user_id
         WHERE (t.title LIKE ? OR t.description LIKE ?) AND t.is_deleted = FALSE
         ORDER BY t.created_at DESC
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.tasks = tasks;
    }

    if (!type || type === "files") {
      const [files] = await db.query(
        `SELECT 
          f.id,
          f.original_name,
          f.mime_type as file_type,
          f.size_bytes as file_size,
          f.created_at as uploaded_at,
          up.full_name as uploader_name,
          'file' as result_type
         FROM files f
         LEFT JOIN users u ON f.uploader_id = u.id
         LEFT JOIN profiles up ON u.id = up.user_id
         WHERE f.original_name LIKE ?
         ORDER BY f.created_at DESC
         LIMIT ?`,
        [searchTerm, parseInt(limit)]
      );
      results.files = files;
    }

    if (!type || type === "departments") {
      const [departments] = await db.query(
        `SELECT 
          d.id,
          d.name,
          d.description,
          'department' as result_type
         FROM departments d
         WHERE (d.name LIKE ? OR d.description LIKE ?) AND d.is_active = TRUE
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.departments = departments;
    }

    if (!type || type === "teams") {
      const [teams] = await db.query(
        `SELECT 
          t.id,
          t.name,
          t.description,
          'team' as result_type
         FROM teams t
         WHERE (t.name LIKE ? OR t.description LIKE ?)
         LIMIT ?`,
        [searchTerm, searchTerm, parseInt(limit)]
      );
      results.teams = teams;
    }

    return results;
  }
}

module.exports = Search;

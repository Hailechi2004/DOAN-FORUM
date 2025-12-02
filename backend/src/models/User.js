const db = require("../config/database");

class UserModel {
  async create(userData) {
    const [result] = await db.execute(
      `INSERT INTO users (email, username, password_hash) 
       VALUES (?, ?, ?)`,
      [userData.email, userData.username, userData.password_hash]
    );
    return result.insertId;
  }

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT u.*, p.full_name, p.phone, p.avatar_url, p.bio, p.birth_date,
              p.address, p.gender, d.name as department_name, t.name as team_name,
              r.name as role_name, ur.department_id as role_department_id
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN employee_records er ON u.id = er.user_id AND er.status = 'active'
       LEFT JOIN departments d ON er.department_id = d.id
       LEFT JOIN teams t ON er.team_id = t.id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      [id]
    );
    return rows[0];
  }

  async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );
    return rows[0];
  }

  async findByUsername(username) {
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE username = ? AND deleted_at IS NULL`,
      [username]
    );
    return rows[0];
  }

  async updateOnlineStatus(userId, isOnline) {
    await db.execute(
      `UPDATE users SET is_online = ?, last_seen = NOW() WHERE id = ?`,
      [isOnline, userId]
    );
  }

  async updateProfile(userId, profileData) {
    const fields = [];
    const values = [];

    if (profileData.full_name !== undefined) {
      fields.push("full_name = ?");
      values.push(profileData.full_name);
    }
    if (profileData.phone !== undefined) {
      fields.push("phone = ?");
      values.push(profileData.phone);
    }
    if (profileData.bio !== undefined) {
      fields.push("bio = ?");
      values.push(profileData.bio);
    }
    if (profileData.avatar_url !== undefined) {
      fields.push("avatar_url = ?");
      values.push(profileData.avatar_url);
    }
    if (profileData.birth_date !== undefined) {
      fields.push("birth_date = ?");
      values.push(profileData.birth_date);
    }
    if (profileData.gender !== undefined) {
      fields.push("gender = ?");
      values.push(profileData.gender);
    }
    if (profileData.address !== undefined) {
      fields.push("address = ?");
      values.push(profileData.address);
    }

    if (fields.length > 0) {
      values.push(userId);
      fields.push("updated_at = NOW()");

      // Check if profile exists
      const [existing] = await db.execute(
        `SELECT user_id FROM profiles WHERE user_id = ?`,
        [userId]
      );

      if (existing.length === 0) {
        // Create profile if doesn't exist
        await db.execute(
          `INSERT INTO profiles (user_id, full_name, phone, bio, avatar_url, birth_date, gender, address, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            profileData.full_name || null,
            profileData.phone || null,
            profileData.bio || null,
            profileData.avatar_url || null,
            profileData.birth_date || null,
            profileData.gender || null,
            profileData.address || null,
          ]
        );
      } else {
        // Update existing profile
        await db.execute(
          `UPDATE profiles SET ${fields.join(", ")} WHERE user_id = ?`,
          values
        );
      }
    }
  }

  async getAll(filters = {}) {
    let query = `
      SELECT u.id, u.email, u.username, u.is_online, u.last_seen,
             p.full_name, p.avatar_url, d.name as department_name
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN employee_records er ON u.id = er.user_id AND er.status = 'active'
      LEFT JOIN departments d ON er.department_id = d.id
      WHERE u.deleted_at IS NULL
    `;

    const params = [];

    if (filters.department_id) {
      query += " AND er.department_id = ?";
      params.push(filters.department_id);
    }

    if (filters.search) {
      query +=
        " AND (u.username LIKE ? OR u.email LIKE ? OR p.full_name LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY u.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  async softDelete(userId) {
    await db.execute(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [
      userId,
    ]);
  }
}

module.exports = new UserModel();

const IUserRepository = require("../../domain/repositories/IUserRepository");
const db = require("../../config/database");

class MySQLUserRepository extends IUserRepository {
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
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];

    // Get roles
    const [roles] = await db.execute(
      `SELECT r.id, r.name FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [id]
    );

    user.roles = roles;
    return user;
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
    // Update profiles table
    const profileFields = [];
    const profileValues = [];

    if (profileData.full_name !== undefined) {
      profileFields.push("full_name = ?");
      profileValues.push(profileData.full_name);
    }
    if (profileData.phone !== undefined) {
      profileFields.push("phone = ?");
      profileValues.push(profileData.phone);
    }
    if (profileData.bio !== undefined) {
      profileFields.push("bio = ?");
      profileValues.push(profileData.bio);
    }
    if (profileData.avatar_url !== undefined) {
      profileFields.push("avatar_url = ?");
      profileValues.push(profileData.avatar_url);
    }
    if (
      profileData.birth_date !== undefined ||
      profileData.date_of_birth !== undefined
    ) {
      profileFields.push("birth_date = ?");
      const dateValue = profileData.birth_date || profileData.date_of_birth;
      profileValues.push(dateValue || null);
    }
    if (profileData.address !== undefined) {
      profileFields.push("address = ?");
      profileValues.push(profileData.address);
    }
    if (profileData.gender !== undefined) {
      profileFields.push("gender = ?");
      profileValues.push(profileData.gender);
    }

    if (profileFields.length > 0) {
      profileValues.push(userId);
      await db.execute(
        `UPDATE profiles SET ${profileFields.join(", ")} WHERE user_id = ?`,
        profileValues
      );
    }

    // Update users table
    const userFields = [];
    const userValues = [];

    if (profileData.email !== undefined) {
      userFields.push("email = ?");
      userValues.push(profileData.email);
    }
    if (profileData.username !== undefined) {
      userFields.push("username = ?");
      userValues.push(profileData.username);
    }

    if (userFields.length > 0) {
      userValues.push(userId);
      await db.execute(
        `UPDATE users SET ${userFields.join(", ")} WHERE id = ?`,
        userValues
      );
    }

    // Update employee_records table
    const employeeFields = [];
    const employeeValues = [];

    if (profileData.employee_id !== undefined) {
      employeeFields.push("employee_code = ?");
      employeeValues.push(profileData.employee_id || null);
    }
    if (profileData.position !== undefined) {
      employeeFields.push("position = ?");
      employeeValues.push(profileData.position || null);
    }
    if (profileData.hire_date !== undefined) {
      employeeFields.push("start_date = ?");
      employeeValues.push(profileData.hire_date || null);
    }
    if (profileData.department_id !== undefined) {
      employeeFields.push("department_id = ?");
      employeeValues.push(profileData.department_id || null);
    }
    if (profileData.team_id !== undefined) {
      employeeFields.push("team_id = ?");
      employeeValues.push(profileData.team_id || null);
    }

    if (employeeFields.length > 0) {
      // Check if employee record exists
      const [existing] = await db.execute(
        `SELECT user_id FROM employee_records WHERE user_id = ?`,
        [userId]
      );

      if (existing.length === 0) {
        // Create employee record
        await db.execute(
          `INSERT INTO employee_records (user_id, employee_code, position, start_date, department_id, team_id, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            profileData.employee_id || null,
            profileData.position || null,
            profileData.hire_date || null,
            profileData.department_id || null,
            profileData.team_id || null,
          ]
        );
      } else {
        // Update existing employee record
        employeeValues.push(userId);
        await db.execute(
          `UPDATE employee_records SET ${employeeFields.join(", ")}, updated_at = NOW() WHERE user_id = ?`,
          employeeValues
        );
      }
    }

    // Update user_roles table
    if (
      profileData.role_ids !== undefined &&
      Array.isArray(profileData.role_ids)
    ) {
      // Delete existing roles
      await db.execute(`DELETE FROM user_roles WHERE user_id = ?`, [userId]);

      // Insert new roles
      if (profileData.role_ids.length > 0) {
        const roleValues = profileData.role_ids.map((roleId) => [
          userId,
          roleId,
        ]);
        for (const [uid, rid] of roleValues) {
          await db.execute(
            `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
            [uid, rid]
          );
        }
      }
    }
  }

  async getAll(filters = {}) {
    let query = `
      SELECT u.id, u.email, u.username, u.is_online, u.last_seen, u.created_at,
             p.full_name, p.avatar_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.deleted_at IS NULL
    `;

    const params = [];

    if (filters.search) {
      query +=
        " AND (u.username LIKE ? OR u.email LIKE ? OR p.full_name LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    query += ` ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    // Count total - use same search condition
    let countQuery =
      "SELECT COUNT(*) as total FROM users u WHERE u.deleted_at IS NULL";
    const countParams = [];
    if (filters.search) {
      countQuery += " AND (u.username LIKE ? OR u.email LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      countParams.push(searchTerm, searchTerm);
    }
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Main query - params only for search, not for limit/offset
    const [users] = await db.execute(query, params);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(userId, data) {
    const fields = [];
    const values = [];

    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.username !== undefined) {
      fields.push("username = ?");
      values.push(data.username);
    }
    if (data.role !== undefined) {
      fields.push("role = ?");
      values.push(data.role);
    }

    if (fields.length > 0) {
      values.push(userId);
      await db.execute(
        `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }
  }

  async delete(userId) {
    await db.execute(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [
      userId,
    ]);
  }

  async search(searchTerm, filters = {}) {
    return this.getAll({ ...filters, search: searchTerm });
  }
}

module.exports = MySQLUserRepository;

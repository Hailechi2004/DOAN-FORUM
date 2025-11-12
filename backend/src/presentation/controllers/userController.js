const container = require("../../container");
const { ApiError, ApiResponse } = require("../../utils/apiHelpers");
const db = require("../../config/database");

class UserController {
  constructor() {
    this.useCases = container.getUserUseCases();
    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.assignRole = this.assignRole.bind(this);
    this.removeRole = this.removeRole.bind(this);
    this.getMyProfile = this.getMyProfile.bind(this);
    this.updateMyProfile = this.updateMyProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  // Get all users (admin)
  async getAll(req, res, next) {
    try {
      const {
        department_id,
        role,
        is_active,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        department_id,
        search,
        page,
        limit,
      };

      const result = await this.useCases.getAllUsers.execute(filters);

      return ApiResponse.success(
        res,
        {
          users: result.users.map((u) => u.toJSON()),
          pagination: result.pagination,
        },
        "Users retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await this.useCases.getUserById.execute(id);

      return ApiResponse.success(
        res,
        user.toJSON(),
        "User retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await this.useCases.getUserById.execute(userId);

      return ApiResponse.success(
        res,
        user.toJSON(),
        "Profile retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Update own profile (employee can only update certain fields)
  async updateMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const allowedFields = [
        "full_name",
        "phone",
        "bio",
        "birth_date",
        "gender",
        "address",
      ];

      // Filter only allowed fields
      const profileData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          profileData[field] = req.body[field];
        }
      });

      // Normalize gender value to match database ENUM('male','female','other','unspecified')
      if (profileData.gender !== undefined) {
        if (profileData.gender === "" || profileData.gender === null) {
          profileData.gender = "unspecified";
        } else {
          profileData.gender = profileData.gender.toLowerCase().trim();
          const allowedGenders = ["male", "female", "other", "unspecified"];
          if (!allowedGenders.includes(profileData.gender)) {
            profileData.gender = "unspecified";
          }
        }
      }

      // Check if profile exists, create if not
      const [existing] = await db.query(
        `SELECT user_id FROM profiles WHERE user_id = ?`,
        [userId]
      );

      if (existing.length === 0) {
        // Create profile if doesn't exist
        await db.query(
          `INSERT INTO profiles (user_id, full_name, phone, bio, birth_date, gender, address, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            profileData.full_name || null,
            profileData.phone || null,
            profileData.bio || null,
            profileData.birth_date || null,
            profileData.gender || null,
            profileData.address || null,
          ]
        );
      } else {
        // Update existing profile
        const fields = [];
        const values = [];

        Object.keys(profileData).forEach((field) => {
          if (profileData[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(profileData[field]);
          }
        });

        if (fields.length > 0) {
          values.push(userId);
          fields.push("updated_at = NOW()");
          await db.query(
            `UPDATE profiles SET ${fields.join(", ")} WHERE user_id = ?`,
            values
          );
        }
      }

      const user = await this.useCases.getUserById.execute(userId);

      return ApiResponse.success(
        res,
        user.toJSON(),
        "Profile updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        throw new ApiError(
          400,
          "Current password and new password are required"
        );
      }

      if (new_password.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
      }

      const bcrypt = require("bcrypt");
      const UserModel = require("../../models/User");

      // Get user with password
      const [users] = await db.query(
        "SELECT id, password_hash FROM users WHERE id = ? AND deleted_at IS NULL",
        [userId]
      );

      if (users.length === 0) {
        throw new ApiError(404, "User not found");
      }

      const user = users[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        current_password,
        user.password_hash
      );
      if (!isValidPassword) {
        throw new ApiError(401, "Current password is incorrect");
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(new_password, 10);

      // Update password
      await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
        newPasswordHash,
        userId,
      ]);

      return ApiResponse.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const profileData = req.body;

      // Normalize gender value to match database ENUM('male','female','other','unspecified')
      if (profileData.gender !== undefined) {
        if (profileData.gender === "" || profileData.gender === null) {
          profileData.gender = "unspecified";
        } else {
          profileData.gender = profileData.gender.toLowerCase().trim();
          // Validate against allowed values
          const allowedGenders = ["male", "female", "other", "unspecified"];
          if (!allowedGenders.includes(profileData.gender)) {
            profileData.gender = "unspecified";
          }
        }
      }

      const user = await this.useCases.updateUserProfile.execute(
        id,
        profileData
      );

      return ApiResponse.success(
        res,
        user.toJSON(),
        "User updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete user (admin)
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      if (parseInt(id) === req.user.id) {
        throw new ApiError(400, "Cannot delete your own account");
      }

      const userRepository = container.getUserRepository();
      const user = await userRepository.findById(id);

      // If user not found or already deleted, just return success
      if (!user) {
        return ApiResponse.success(res, null, "User deleted successfully");
      }

      await userRepository.delete(id);
      return ApiResponse.success(res, null, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Assign role to user
  async assignRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role_id } = req.body;

      const user = await this.useCases.getUserById.execute(id);

      // Check if role exists
      const [roles] = await db.query(`SELECT id FROM roles WHERE id = ?`, [
        role_id,
      ]);
      if (roles.length === 0) {
        throw new ApiError(404, "Role not found");
      }

      // Check if already assigned
      const [existing] = await db.query(
        `SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?`,
        [id, role_id]
      );

      if (existing.length > 0) {
        throw new ApiError(400, "Role already assigned to user");
      }

      await db.query(
        `INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, NOW())`,
        [id, role_id]
      );

      return ApiResponse.success(res, null, "Role assigned successfully");
    } catch (error) {
      next(error);
    }
  }

  // Remove role from user
  async removeRole(req, res, next) {
    try {
      const { id, roleId } = req.params;

      const [result] = await db.query(
        `DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`,
        [id, roleId]
      );

      if (result.affectedRows === 0) {
        throw new ApiError(404, "Role assignment not found");
      }

      return ApiResponse.success(res, null, "Role removed successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

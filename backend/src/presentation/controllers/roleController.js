const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const db = require("../../config/database");

// Role Controller - CRUD operations for roles
class RoleController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  // Get all roles
  async getAll(req, res, next) {
    try {
      const [roles] = await db.query(
        `SELECT id, name, description, created_at, updated_at 
         FROM roles 
         ORDER BY name`
      );

      return ApiResponse.success(res, roles, "Roles retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get role by ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const [roles] = await db.query(
        `SELECT id, name, description, created_at, updated_at 
         FROM roles 
         WHERE id = ?`,
        [id]
      );

      if (roles.length === 0) {
        throw new ApiError(404, "Role not found");
      }

      return ApiResponse.success(res, roles[0], "Role retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  // Create new role
  async create(req, res, next) {
    try {
      const { name, description } = req.body;

      if (!name) {
        throw new ApiError(400, "Role name is required");
      }

      // Check if role already exists
      const [existing] = await db.query(`SELECT id FROM roles WHERE name = ?`, [
        name,
      ]);

      if (existing.length > 0) {
        throw new ApiError(400, "Role already exists");
      }

      const [result] = await db.query(
        `INSERT INTO roles (name, description, created_at, updated_at) 
         VALUES (?, ?, NOW(), NOW())`,
        [name, description || null]
      );

      const [newRole] = await db.query(
        `SELECT id, name, description, created_at, updated_at 
         FROM roles 
         WHERE id = ?`,
        [result.insertId]
      );

      return ApiResponse.success(
        res,
        newRole[0],
        "Role created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update role
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Check if role exists
      const [existing] = await db.query(`SELECT id FROM roles WHERE id = ?`, [
        id,
      ]);

      if (existing.length === 0) {
        throw new ApiError(404, "Role not found");
      }

      // Check if new name conflicts with another role
      if (name) {
        const [conflict] = await db.query(
          `SELECT id FROM roles WHERE name = ? AND id != ?`,
          [name, id]
        );

        if (conflict.length > 0) {
          throw new ApiError(400, "Role name already exists");
        }
      }

      const fields = [];
      const values = [];

      if (name !== undefined) {
        fields.push("name = ?");
        values.push(name);
      }
      if (description !== undefined) {
        fields.push("description = ?");
        values.push(description);
      }

      if (fields.length > 0) {
        fields.push("updated_at = NOW()");
        values.push(id);

        await db.query(
          `UPDATE roles SET ${fields.join(", ")} WHERE id = ?`,
          values
        );
      }

      const [updatedRole] = await db.query(
        `SELECT id, name, description, created_at, updated_at 
         FROM roles 
         WHERE id = ?`,
        [id]
      );

      return ApiResponse.success(
        res,
        updatedRole[0],
        "Role updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete role
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Check if role exists
      const [existing] = await db.query(
        `SELECT id, name FROM roles WHERE id = ?`,
        [id]
      );

      if (existing.length === 0) {
        throw new ApiError(404, "Role not found");
      }

      // Check if role is in use
      const [inUse] = await db.query(
        `SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?`,
        [id]
      );

      if (inUse[0].count > 0) {
        throw new ApiError(
          400,
          `Cannot delete role "${existing[0].name}" - it is assigned to ${inUse[0].count} user(s)`
        );
      }

      await db.query(`DELETE FROM roles WHERE id = ?`, [id]);

      return ApiResponse.success(res, null, "Role deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();

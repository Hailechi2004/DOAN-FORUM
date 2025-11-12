const db = require("../../config/database");
const { ApiError } = require("../../utils/apiHelpers");

const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      // Role mapping: simplified role names -> actual database role names
      const roleMapping = {
        admin: ["System Admin", "Administrator"],
        manager: ["Department Manager", "Manager"],
        employee: ["Employee", "User"],
      };

      // Get user roles from database
      const [roles] = await db.execute(
        `SELECT r.name FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [req.user.id]
      );

      const userRoles = roles.map((r) => r.name);

      // Also check user.role from users table for backward compatibility
      if (req.user.role) {
        userRoles.push(req.user.role);
      }

      // Check if user has any of the allowed roles (with mapping)
      const hasPermission = allowedRoles.some((allowedRole) => {
        // Check direct match
        if (userRoles.includes(allowedRole)) {
          return true;
        }
        // Check mapped roles
        const mappedRoles = roleMapping[allowedRole] || [];
        return mappedRoles.some((mapped) => userRoles.includes(mapped));
      });

      if (!hasPermission) {
        throw new ApiError(403, "Insufficient permissions");
      }

      req.user.roles = userRoles;
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};

module.exports = authorize;

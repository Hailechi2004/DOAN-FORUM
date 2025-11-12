const db = require('../config/database');
const { ApiError } = require('../utils/apiHelpers');

const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // Get user roles
      const [roles] = await db.execute(
        `SELECT r.code FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [req.user.id]
      );

      const userRoles = roles.map(r => r.code);

      // Check if user has any of the allowed roles
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));

      if (!hasPermission) {
        throw new ApiError(403, 'Insufficient permissions');
      }

      req.user.roles = userRoles;
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

module.exports = authorize;

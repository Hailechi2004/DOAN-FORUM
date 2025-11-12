const tokenService = require("../utils/tokenService");
const { ApiError } = require("../utils/apiHelpers");
const UserModel = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.substring(7);
    const decoded = tokenService.verifyAccessToken(token);

    // Get user from database
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // Check if account is active (use 'status' column, not 'is_active')
    if (user.status !== "active") {
      throw new ApiError(403, "Account is disabled");
    }

    // Get user roles and department
    const db = require("../config/database");
    const [userRoles] = await db.query(
      `SELECT r.name as role_name, ur.role_id, ur.department_id 
       FROM roles r 
       INNER JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = ?`,
      [user.id]
    );

    // Extract role names and department_id
    const roles = userRoles.map((r) => r.role_name);
    const department_id =
      userRoles.length > 0 ? userRoles[0].department_id : null;
    const role_id = userRoles.length > 0 ? userRoles[0].role_id : null;

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: roles,
      department_id: department_id,
      role_id: role_id,
      role: roles[0] || null, // Primary role name
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticate;

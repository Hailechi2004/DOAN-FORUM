const tokenService = require("../../utils/tokenService");
const { ApiError } = require("../../utils/apiHelpers");
const UserModel = require("../../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.substring(7);
    const decoded = tokenService.verifyAccessToken(token);

    // Get user from database with role and department
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // Check if account is active (use 'status' column, not 'is_active')
    if (user.status !== "active") {
      throw new ApiError(403, "Account is disabled");
    }

    // Get role from user_roles JOIN (role_name)
    const role = user.role_name || null;
    const department_id = user.role_department_id || null;

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: role,
      department_id: department_id,
      is_system_admin: user.is_system_admin === 1,
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

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

    // Get user from database
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // Check if account is active (use 'status' column, not 'is_active')
    if (user.status !== "active") {
      throw new ApiError(403, "Account is disabled");
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
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

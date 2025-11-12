const bcrypt = require("bcrypt");
const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const tokenService = require("../../utils/tokenService");
const UserModel = require("../../models/User");
const db = require("../../config/database");
const redisClient = require("../../config/redis");

class AuthController {
  async register(req, res, next) {
    try {
      const { email, username, password, full_name, phone } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new ApiError(400, "Email already registered");
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        throw new ApiError(400, "Username already taken");
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Create user
      const userId = await UserModel.create({
        email,
        username,
        password_hash,
      });

      // Create user profile (use 'profiles' table, not 'user_profiles')
      await db.execute(
        `INSERT INTO profiles (user_id, full_name, phone) VALUES (?, ?, ?)`,
        [userId, full_name || username, phone || null]
      );

      // Assign default role
      const [defaultRole] = await db.execute(
        `SELECT id FROM roles WHERE name = 'user' LIMIT 1`
      );
      if (defaultRole.length > 0) {
        await db.execute(
          `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
          [userId, defaultRole[0].id]
        );
      }

      // Generate tokens
      const accessToken = tokenService.generateAccessToken({ userId });
      const refreshToken = tokenService.generateRefreshToken({ userId });

      // Store refresh token in Redis (if available)
      try {
        if (redisClient && redisClient.status === "ready") {
          await redisClient.setex(
            `refresh_token:${userId}`,
            7 * 24 * 60 * 60, // 7 days
            refreshToken
          );
        }
      } catch (redisError) {
        console.warn("⚠️  Redis not available for token storage");
      }

      ApiResponse.success(
        res,
        {
          user: {
            id: userId,
            email,
            username,
            full_name: full_name || username,
          },
          accessToken,
          refreshToken,
        },
        "Registration successful",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new ApiError(401, "Invalid email or password");
      }

      // Check if account is active (use 'status' column, not 'is_active')
      if (user.status !== "active") {
        throw new ApiError(403, "Account is disabled");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid email or password");
      }

      // Generate tokens
      const accessToken = tokenService.generateAccessToken({ userId: user.id });
      const refreshToken = tokenService.generateRefreshToken({
        userId: user.id,
      });

      // Store refresh token in Redis (if available)
      try {
        if (redisClient && redisClient.status === "ready") {
          await redisClient.setex(
            `refresh_token:${user.id}`,
            7 * 24 * 60 * 60,
            refreshToken
          );
        }
      } catch (redisError) {
        console.warn("⚠️  Redis not available for token storage");
      }

      // Update online status
      await UserModel.updateOnlineStatus(user.id, true);

      // Get full user data
      const userData = await UserModel.findById(user.id);

      // Get user roles and department
      const [userRoles] = await db.execute(
        `SELECT r.id, r.name, r.description, ur.department_id 
         FROM roles r
         INNER JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = ?`,
        [user.id]
      );

      // Extract department_id (from first role, assuming one role per user)
      const department_id =
        userRoles.length > 0 ? userRoles[0].department_id : null;
      const role = userRoles.length > 0 ? userRoles[0].name : null;
      const role_id = userRoles.length > 0 ? userRoles[0].id : null;

      ApiResponse.success(
        res,
        {
          user: {
            id: userData.id,
            email: userData.email,
            username: userData.username,
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
            department_name: userData.department_name,
            team_name: userData.team_name,
            department_id: department_id, // Add department_id from user_roles
            role: role, // Add primary role name
            role_id: role_id, // Add role_id
            roles: userRoles, // Full roles array
          },
          token: accessToken, // Changed from accessToken to token for frontend
          refreshToken,
        },
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
      }

      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);

      // Check if token exists in Redis
      const storedToken = await redisClient.get(
        `refresh_token:${decoded.userId}`
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // Generate new tokens
      const newAccessToken = tokenService.generateAccessToken({
        userId: decoded.userId,
      });
      const newRefreshToken = tokenService.generateRefreshToken({
        userId: decoded.userId,
      });

      // Update refresh token in Redis
      await redisClient.setex(
        `refresh_token:${decoded.userId}`,
        7 * 24 * 60 * 60,
        newRefreshToken
      );

      ApiResponse.success(
        res,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;

      // Remove refresh token from Redis
      await redisClient.del(`refresh_token:${userId}`);

      // Update online status
      await UserModel.updateOnlineStatus(userId, false);

      ApiResponse.success(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userData = await UserModel.findById(req.user.id);

      if (!userData) {
        throw new ApiError(404, "User not found");
      }

      ApiResponse.success(res, userData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

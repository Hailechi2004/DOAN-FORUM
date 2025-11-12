const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

class TokenService {
  generateAccessToken(payload) {
    return jwt.sign(payload, jwtConfig.accessTokenSecret, {
      expiresIn: jwtConfig.accessTokenExpiry,
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience
    });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
      expiresIn: jwtConfig.refreshTokenExpiry,
      issuer: jwtConfig.options.issuer,
      audience: jwtConfig.options.audience
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.accessTokenSecret, {
        issuer: jwtConfig.options.issuer,
        audience: jwtConfig.options.audience
      });
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshTokenSecret, {
        issuer: jwtConfig.options.issuer,
        audience: jwtConfig.options.audience
      });
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}

module.exports = new TokenService();

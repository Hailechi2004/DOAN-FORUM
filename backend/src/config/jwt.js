module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-token-key-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-token-key-change-in-production',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  
  options: {
    issuer: 'company-forum',
    audience: 'company-forum-users'
  }
};

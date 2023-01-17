// email token expiry time will be 7 days
module.exports = {
  ACCESS_TOKEN_EXPIRY: "59m",
  REFRESH_TOKEN_EXPIRY: Date.now() + 7 * 24 * 60 * 60 * 1000,
  RESET_TOKEN_EXPIRY: Date.now() + 7 * 24 * 60 * 60 * 1000,
  EMAIL_TOKEN_EXPIRY: Date.now() + 7 * 24 * 60 * 60 * 1000,
  SALT_ROUNDS: 10,
};

const { verifySignUp } = require("../../../middleware/verifySignUp");

const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../../../middleware/authJwt");
const {
  createUser,
  signin,
  verifyEmail,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} = require("../../../controllers/web/auth.js");
const upload = require("../../../middleware/multer.js");

router.post("/signin", upload.none(), signin);
router.post("/change-password", upload.none(), isAuthenticated, changePassword);
router.post("/create-user", upload.any("attachment"), verifySignUp, createUser);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", upload.none(), forgotPassword);
router.post("/reset-password", upload.none(), resetPassword);
router.get("/refresh-token", refreshToken);
router.get("/logout", logout);

module.exports = router;

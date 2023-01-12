const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../../../middleware/authJwt");
const {
  signin,
  changePassword,
  logout,
} = require("../../../controllers/frontend/auth.js");
const upload = require("../../../middleware/multer.js");

router.post("/signin", upload.none(), signin);
router.post("/change-password", upload.none(), isAuthenticated, changePassword);
router.get("/logout", isAuthenticated, logout);

module.exports = router;

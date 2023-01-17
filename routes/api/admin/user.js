const express = require("express");
const router = express.Router();
const {
  profile,
  getUser,
  updateUser,
} = require("../../..../../../controllers/admin/user.js");
const { isAuthenticated } = require("../../../middleware/authJwt");
const upload = require("../../../middleware/multer.js");

router.get("/profile", isAuthenticated, profile);
router.get("/", isAuthenticated, getUser);
router.put("/update", isAuthenticated, upload.any("attachment"), updateUser);

module.exports = router;

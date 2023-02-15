const express = require("express");
const router = express.Router();
const upload = require("../../../middleware/multer");
const {
  isAuthenticated,
  isAdmin,
  isHR,
  isAdminOrHR,
} = require("../../../middleware/authJwt");
const {
  getProject,
  addProject,
  updateProject,
} = require("../../../controllers/web/project");
// Admin and HR can access this route
router.get("/", isAuthenticated, isAdminOrHR, getProject);
router.post("/add", isAuthenticated, upload.none(), addProject);
router.put("/update", isAuthenticated, upload.none(), updateProject);

module.exports = router;

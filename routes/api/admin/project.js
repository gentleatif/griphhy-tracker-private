const express = require("express");
const router = express.Router();
const upload = require("../../../middleware/multer");
const { isAuthenticated } = require("../../../middleware/authJwt");
const {
  getProject,
  addProject,
} = require("../../../controllers/admin/project");

router.get("/", isAuthenticated, getProject);
router.post("/add", isAuthenticated, upload.none(), addProject);

module.exports = router;

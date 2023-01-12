const express = require("express");
const router = express.Router();
const upload = require("../../../middleware/multer");
const { isAuthenticated } = require("../../../middleware/authJwt");
const {
  getProject,
  addProject,
} = require("../../../controllers/frontend/project");

router.get("/", isAuthenticated, getProject);

module.exports = router;

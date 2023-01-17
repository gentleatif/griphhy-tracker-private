const express = require("express");
const router = express.Router();
const upload = require("../../../middleware/multer");
const { isAuthenticated } = require("../../../middleware/authJwt");
const {
  getProject,
  addProject,
  updateProject,
} = require("../../../controllers/web/project");
const { route } = require("./auth");

router.get("/", isAuthenticated, getProject);
router.post("/add", isAuthenticated, upload.none(), addProject);
router.put("/update", isAuthenticated, upload.none(), updateProject);

module.exports = router;

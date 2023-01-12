const express = require("express");
const router = express.Router();
const {
  addDescription,
  getDescription,
} = require("../../..../../../controllers/frontend/description");
const { isAuthenticated } = require("../../../middleware/authJwt");
const upload = require("../../../middleware/multer.js");

router.post("/add", isAuthenticated, upload.none(), addDescription);
router.get("/", isAuthenticated, getDescription);

module.exports = router;

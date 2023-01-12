const express = require("express");
const router = express.Router();
const {
  addScreenshot,
} = require("../../..../../../controllers/frontend/screenshot");
const { isAuthenticated } = require("../../../middleware/authJwt");
const upload = require("../../../middleware/multer.js");

router.post("/add", isAuthenticated, upload.single("photo"), addScreenshot);

module.exports = router;

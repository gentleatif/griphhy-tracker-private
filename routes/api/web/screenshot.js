const express = require("express");
const router = express.Router();

const { getScreenshot } = require("../../../controllers/web/screenshot");
const { isAuthenticated } = require("../../../middleware/authJwt");

router.get("/", isAuthenticated, getScreenshot);

module.exports = router;

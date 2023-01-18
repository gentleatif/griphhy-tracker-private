const express = require("express");
const router = express.Router();

const { getScreenshot } = require("../../../controllers/web/screenshot");
const { isAuthenticated, isAdminOrHR } = require("../../../middleware/authJwt");

router.get("/", isAuthenticated, isAdminOrHR, getScreenshot);

module.exports = router;

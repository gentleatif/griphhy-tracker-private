const express = require("express");
const router = express.Router();
const { profile } = require("../../..../../../controllers/frontend/user.js");
const { isAuthenticated } = require("../../../middleware/authJwt");

router.get("/profile", isAuthenticated, profile);

module.exports = router;

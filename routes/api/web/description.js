const express = require("express");
const router = express.Router();

const { getDescription } = require("../../../controllers/web/description");
const { isAuthenticated } = require("../../../middleware/authJwt");

router.get("/", isAuthenticated, getDescription);

module.exports = router;

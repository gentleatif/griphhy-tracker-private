const express = require("express");
const router = express.Router();
const {
  googleWorkspaceCreateUser,
} = require("../../../controllers/web/workspace.js");
// const { isAuthenticated } = require("../../../middleware/authJwt.js");
const upload = require("../../../middleware/multer.js");
router.post("/create-employee", upload.none(), googleWorkspaceCreateUser);

module.exports = router;

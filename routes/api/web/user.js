const express = require("express");
const router = express.Router();
const {
  createUser,
  updateUser,
  getUser,
  deleteUser,
} = require("../../../controllers/web/user");
const { verifySignUp } = require("../../../middleware/verifySignUp.js");
const { isAuthenticated } = require("../../../middleware/authJwt.js");
const upload = require("../../../middleware/multer.js");

router.post(
  "/create-user",
  isAuthenticated,
  upload.any("attachment"),
  verifySignUp,
  createUser
);
router.put(
  "/upate-user",
  isAuthenticated,
  upload.any("attachment"),
  isAuthenticated,
  updateUser
);
router.get("/get-user", isAuthenticated, getUser);
router.delete("/delete-user", isAuthenticated, deleteUser);

module.exports = router;

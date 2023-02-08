const express = require("express");
const router = express.Router();
const {
  createUser,
  updateUser,
  getUser,
  deleteUser,
} = require("../../../controllers/web/workspace.js");
const { verifySignUp } = require("../../../middleware/verifySignUp.js");
// const { isAuthenticated } = require("../../../middleware/authJwt.js");
const upload = require("../../../middleware/multer.js");
router.post("/create-employee", upload.any("attachment"), createUser);

router.put("/upate-employee", upload.any("attachment"), updateUser);
router.get("/get-employee", getUser);
router.delete("/delete-employee", deleteUser);
module.exports = router;

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
const { uploadFile, getFileStream } = require("../../../config/s3");

router.post(
  "/create-user",
  isAuthenticated,
  verifySignUp,
  upload.any("attachment"),
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
router.post("/upload-image", upload.single("image"), async (req, res) => {
  const imageKey = await uploadFile(req.file);
  res.send({ imageKey });
});

router.get("/image", (req, res) => {
  const key = "1676289659946main board.jpg";
  const url = getFileStream(key);
  return res.status(200).send(url);
});
module.exports = router;

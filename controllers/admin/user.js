const db = require("../../models");
const User = db.User;
const Project = db.Project;
const Attachment = db.attachment;
exports.profile = async (req, res) => {
  let user = await User.findOne({
    where: { id: req.userId },
    // attributes: ["id", "name", "profilePic", "todayTotalTrackedTime"],
  });
  // user = await user.getAttachments();
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  return res.status(200).send(user);
};

exports.getUser = async (req, res) => {
  let user = await User.findAll({
    where: { ...req.query },
    attributes: [
      "id",
      "fullname",
      "description",
      "employeeId",
      "address",
      "profilePic",
      "role",
    ],
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }
  return res.status(200).send(user);
};

exports.updateUser = async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).send({ message: "User id is required" });
  }
  let user = await User.findOne({
    where: { id: id },
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }
  let attachment_name = req.body.attachment_name;
  // when req.file name is profilePic
  if (
    req.files &&
    req.files.length > 0 &&
    req.files[0].fieldname === "profilePic"
  ) {
    user.profilePic = req.files[0].path;
  }

  if (
    req.files &&
    req.files.length > 0 &&
    req.files[0].fieldname !== "profilePic"
  ) {
    // loop through req.files and create an array of objects
    let user_media = req.files.map((file, index) => {
      console.log();
      return {
        imgPath: file.path,
        name: attachment_name[index],
      };
    });
    console.log("user media ========>", user_media);
    // insert many user_media
    user_media = await Attachment.bulkCreate(user_media);
    // get ids of user_media
    user_media = user_media.map((media) => media.id);
    // set user_media to user
    user.attachment = user_media;
  }
  // update all the fields available in the request body
  try {
    //  set the new values for the user using sequelize
    user = await user.set({
      ...req.body,
      // only return
    });
    // returning only id and name after updating all the fields available in the request body
    user = await user.save();
    user.password = undefined;
    user.emailVerified = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    user.resetPasswordToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    user.UserProjectId = undefined;
    user.refreshToken = undefined;

    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
};

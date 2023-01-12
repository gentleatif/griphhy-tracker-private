const db = require("../../models");
// const attachment = require("../../models/attachment");
const User = db.user;
const Project = db.project;
const Attachment = db.attachment;
exports.profile = async (req, res) => {
  // parse jwt of user and find user from mysql
  // populate user attachment and project they are associcated with
  let user = await User.findOne({
    // include: [
    //   {
    //     model: Project,
    //     through: { attributes: [] },
    //   },
    //   Attachment,
    // ],
    where: { id: req.userId },
    attributes: ["id", "name", "profilePic", "todayTotalTrackedTime"],
  });
  // user = await user.getAttachments();
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  return res.status(200).send(user);
};

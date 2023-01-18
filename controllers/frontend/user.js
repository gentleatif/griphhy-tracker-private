const db = require("../../models");
// const attachment = require("../../models/attachment");
const User = db.User;
const Project = db.Project;
const Attachment = db.attachment;
const User_project = db.User_Project;
const Screenshot = db.screenshot;
const Sequelize = require("sequelize");
exports.profile = async (req, res) => {
  let user = await User.findOne({
    where: { id: req.userId },
    attributes: ["id", "fullname", "profilePic", "status"],
    include: [
      {
        model: Screenshot,
      },
    ],
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();

  // loop through user Screenshots and calculate
  //  totalTimeOfTodayOnAllProject
  user = user.toJSON();
  let totalTimeOfTodayOnAllProject = 0;

  user.Screenshots.map((singleScreenshot) => {
    if (
      singleScreenshot.TimeOfCapture >= TODAY_START &&
      singleScreenshot.TimeOfCapture <= NOW
    ) {
      totalTimeOfTodayOnAllProject += singleScreenshot.duration;
    }
  });
  user.totalTimeOfTodayOnAllProject =
    Math.floor(totalTimeOfTodayOnAllProject / 60) +
    "h " +
    (totalTimeOfTodayOnAllProject % 60) +
    "m";
  delete user.Screenshots;

  return res.status(200).send(user);
};

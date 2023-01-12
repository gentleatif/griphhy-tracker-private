const db = require("../../models");
// const attachment = require("../../models/attachment");
const User = db.user;
const Project = db.Project;
const Attachment = db.attachment;
const User_project = db.User_Project;
const Screenshot = db.screenshot;
const Sequelize = require("sequelize");
exports.profile = async (req, res) => {
  let user = await User.findOne({
    where: { id: req.userId },
    attributes: ["id", "fullname", "profilePic"],
  });
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();

  let screenshotOfUserOfAllProjects = await User_project.findAll({
    where: { userId: req.userId },
    include: [
      {
        model: Screenshot,
      },
    ],
  });

  let allProjectOfUserWithTime = screenshotOfUserOfAllProjects.map(
    (project) => {
      let totalTimeOfToday = 0;
      project.Screenshots.map((singleScreenshot) => {
        if (
          singleScreenshot.createdAt >= TODAY_START &&
          singleScreenshot.createdAt <= NOW
        ) {
          totalTimeOfToday += singleScreenshot.duration;
        }
      });
      project = project.toJSON();
      // convert totalTimeOfday min to hour and min
      project.totalTimeOfToday = totalTimeOfToday;
      delete project.Screenshots;
      return project;
    }
  );

  let totalTrackedTimeInMin = 0;
  user = user.toJSON();

  totalTrackedTimeInMin = allProjectOfUserWithTime.reduce((acc, cValue) => {
    return acc + cValue.totalTimeOfToday;
  }, 0);
  user.totalTimeOfTodayOnAllProject =
    Math.floor(totalTrackedTimeInMin / 60) +
    "h " +
    (totalTrackedTimeInMin % 60) +
    "m";

  // user = await user.getAttachments();
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  return res.status(200).send(user);
};

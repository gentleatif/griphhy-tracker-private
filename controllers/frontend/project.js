const db = require("../../models");
const User = db.User;
const Project = db.Project;
const Sequelize = require("sequelize");
const Screenshot = db.screenshot;
exports.getProject = async (req, res) => {
  //   1. find current user
  let user = await User.findOne({
    where: { id: req.userId },
  });
  if (!user) {
    return res.status(404).send({ message: "User Not found." });
  }

  let projects = await user.getProjects({
    where: { ...req.query },
    through: { attributes: [] },
    include: [
      {
        model: Screenshot,
      },
    ],
  });

  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);

  let NOW = new Date();
  NOW = NOW.getTime();

  projects = projects.map((project) => {
    let totalTimeOfAllDays = 0;
    let totalTimeOfToday = 0;
    project.Screenshots.map((singleScreenshot) => {
      if (
        singleScreenshot.TimeOfCapture >= TODAY_START &&
        singleScreenshot.TimeOfCapture <= NOW
      ) {
        console.log("time screentshot");
        totalTimeOfToday += singleScreenshot.duration;
      }

      totalTimeOfAllDays += singleScreenshot.duration;
    });

    project = project.toJSON();

    project.totalTimeOfToday =
      Math.floor(totalTimeOfToday / 60) + "h " + (totalTimeOfToday % 60) + "m";
    project.totalTimeOfAllDays =
      Math.floor(totalTimeOfAllDays / 60) +
      "h " +
      (totalTimeOfAllDays % 60) +
      "m";

    delete project.Screenshots;
    delete project.User_Project;

    return project;
  });

  return res.status(200).send(projects);
};

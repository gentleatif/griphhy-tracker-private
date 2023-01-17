const db = require("../../models");
const User = db.User;
const Project = db.Project;
const User_project = db.User_Project;
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
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();
  let screenshotOfUserOfAllProjects = await User_project.findAll({
    where: { UserId: req.userId, ...req.query },
    include: [
      {
        model: Screenshot,
      },
      {
        model: Project,
      },
    ],
  });

  // screenshotOfUserOfAllProjects.Project = screenshotOfUserOfAllProjects.Project;

  let userProjects = await screenshotOfUserOfAllProjects.map((project) => {
    let totalTimeOfAllDays = 0;
    let totalTimeOfToday = 0;

    project.Screenshots.map((singleScreenshot) => {
      if (
        singleScreenshot.createdAt >= TODAY_START &&
        singleScreenshot.createdAt <= NOW
      ) {
        totalTimeOfToday += singleScreenshot.duration;
      }

      totalTimeOfAllDays += singleScreenshot.duration;
    });
    project = project.toJSON();
    // convert totalTimeOfday min to hour and min
    project.totalTimeOfToday =
      Math.floor(totalTimeOfToday / 60) + "h " + (totalTimeOfToday % 60) + "m";
    // convert totalTimeOfAllDays min to hour and min
    project.totalTimeOfAllDays =
      Math.floor(totalTimeOfAllDays / 60) +
      "h " +
      (totalTimeOfAllDays % 60) +
      "m";
    // find project that associated with user_project
    project.name = project.Project.name;
    project.subtitle = project.Project.subtitle;
    project.status = project.Project.status;
    delete project.Project;
    delete project.ProjectId;
    delete project.Screenshots;
    console.log("project --->", project);
    //  only return project that status is 1
    if (project.status == 1) {
      delete project.status;
      return project;
    }
  });
  //  remove null project from prject list
  userProjects = await Promise.all(userProjects);
  userProjects = userProjects.filter((project) => project != null);

  return res.status(200).send(userProjects);
};

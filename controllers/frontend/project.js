const { screenshot } = require("../../models");
const db = require("../../models");
const User = db.user;
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
    where: { userId: req.userId, ...req.query },
    include: [
      {
        model: Screenshot,
      },
    ],
  });

  console.log("screenshotOfUserOfAllProjects", screenshotOfUserOfAllProjects);
  // khatarnak loop ghumap
  let userProjects = screenshotOfUserOfAllProjects.map((project) => {
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
    // remove screenshots from project

    delete project.Screenshots;
    return project;
  });

  //add name of all project in the user_project

  return res.status(200).send(userProjects);
};

exports.addProject = async (req, res) => {
  const { name, subtitle, users, status } = req.body;
  console.log("req.body", req.body);
  try {
    let project = await Project.create({
      name,
      subtitle,
      status,
      users,
    });

    let user = await User.findOne({
      where: { id: req.userId },
    });
    project = await user.addProject(project);
    return res.status(200).send(project);
  } catch (error) {
    return res.status(500).send(error);
  }
};

// update Project
exports.updateProject = async (req, res) => {
  const { name, subtitle, users, status } = req.body;
  try {
    let project = await Project.findOne(
      {
        name,
        subtitle,
        status,
        users,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    return res.status(200).send(project);
  } catch (error) {
    return res.status(500).send(error);
  }
};

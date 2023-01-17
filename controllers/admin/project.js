const db = require("../../models");
const User = db.user;
const Project = db.Project;
const User_project = db.User_Project;
const Screenshot = db.screenshot;
const User_projectScreenshot = db.user_projectScreenshot;
const Sequelize = require("sequelize");

exports.getProject = async (req, res) => {
  console.log("req.query", req.query);
  // let user_project = await User_project.findAll({
  //   where: { ...req.query },
  //   include: [
  //     {
  //       model: Project,
  //     },
  //   ],
  // });
  // return res.status(200).send(user_project);
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();
  let screenshotOfUserOfAllProjects = await User_project.findAll({
    where: { ...req.query },
    include: [
      {
        model: Screenshot,
      },
      {
        model: Project,
      },
    ],
  });

  screenshotOfUserOfAllProjects.Project = screenshotOfUserOfAllProjects.Project;

  let userProjects = screenshotOfUserOfAllProjects.map(async (project) => {
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
    // project.users = project.getUsers();
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
    // project.Project.getUsers();

    delete project.Project;
    delete project.ProjectId;
    delete project.Screenshots;
    //  only return project that status is 1
    if (project.status == 1) {
      delete project.status;
      return project;
    }
  });
  userProjects = await Promise.all(userProjects);
  userProjects = userProjects.filter((project) => project != undefined);
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
      where: { id: 1 },
    });
    console.log("user --------->", user);
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

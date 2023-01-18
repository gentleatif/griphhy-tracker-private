const db = require("../../models");
const User = db.User;
const Project = db.Project;
const User_project = db.User_Project;
const Screenshot = db.screenshot;
const Sequelize = require("sequelize");

exports.getProject = async (req, res) => {
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();
  let projects = await Project.findAll({
    where: { ...req.query },
    include: [
      {
        model: User,
        include: [Screenshot],
        through: { attributes: [] },
        // get only few attributes of user
        attributes: [
          "id",
          "fullname",
          "email",
          "designation",
          "description",
          "attachment",
          "address",
          "employeeId",
          "profilePic",
          "role",
          "gender",
          "status",
          "createdAt",
          "updatedAt",
        ],
      },
    ],
  });

  // loop through each project each
  // user each screenshot and calculate
  // the total time
  projects = projects.map(async (project) => {
    project = project.toJSON();
    project.Users.map((user) => {
      let totalTimeOfAllDays = 0;
      let totalTimeOfToday = 0;
      user.Screenshots.map((singleScreenshot) => {
        if (
          singleScreenshot.TimeOfCapture >= TODAY_START &&
          singleScreenshot.TimeOfCapture <= NOW
        ) {
          totalTimeOfToday += singleScreenshot.duration;
        }

        totalTimeOfAllDays += singleScreenshot.duration;
      });

      user.totalTimeOfToday =
        Math.floor(totalTimeOfToday / 60) +
        "h " +
        (totalTimeOfToday % 60) +
        "m";

      // convert totalTimeOfAllDays min to hour and min
      user.totalTimeOfAllDays =
        Math.floor(totalTimeOfAllDays / 60) +
        "h " +
        (totalTimeOfAllDays % 60) +
        "m";

      delete user.Screenshots;

      return user;
    });

    return project;
  });

  projects = await Promise.all(projects);
  return res.status(200).send(projects);
};

exports.addProject = async (req, res) => {
  const { name, subtitle, users, status } = req.body;

  try {
    let project = await Project.create({
      name,
      subtitle,
      status,
    });
    let foundUser = await User.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: users,
        },
      },
    });

    await project.setUsers(foundUser);

    return res.status(200).send({
      message: "project created successfully",
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

// update Project
exports.updateProject = async (req, res) => {
  const { name, subtitle, users, status } = req.body;
  const id = req.query.id;

  try {
    let project = await Project.findOne({
      where: { id: id },
    });
    if (!project) {
      return res.status(404).send("project not found");
    }
    let foundUsers = await User.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: users,
        },
      },
    });
    await project.setUsers(foundUsers);
    await project.update({
      name,
      subtitle,
      status,
    });

    return res.status(200).send({
      message: "project updated successfully",
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

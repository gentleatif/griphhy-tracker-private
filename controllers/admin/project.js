const { project } = require("../../models");
const db = require("../../models");
const User = db.user;
const Project = db.project;
const User_project = db.user_project;
const Screenshot = db.screenshot;
const User_projectScreenshot = db.user_projectScreenshot;

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
    joinTableAttributes: [],
  });

  return res.status(200).send(projects);
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

const { user } = require("../../models");
const db = require("../../models");
const User = db.User;
const Project = db.Project;
const UserProject = db.User_Project;
const Description = db.description;

exports.getDescription = async (req, res) => {
  const userId = req.userId;
  const { id } = req.query;
  const { description } = req.body;
  if (!id) {
    return res.status(400).send({ message: "Project id is required" });
  }

  if (!userId) {
    return res.status(400).send({ message: "Invalid UserId" });
  }
  if (description) {
    return res.status(400).send({ message: "Description is required" });
  }

  try {
    const project = await Project.findOne({
      where: { id },
    });
    if (!project) {
      return res.status(400).send({ message: "Project not found" });
    }
    const user = await User.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    const description = await Description.findAll({
      where: { ProjectId: id, UserId: userId },
    });
    if (!description) {
      return res.status(400).send({ message: "Description not found" });
    }
    let lastDescription = description[description.length - 1];

    return res.status(200).send(lastDescription);
  } catch (error) {
    return res
      .status(500)
      .send("Error while getting description: " + error.message);
  }
};

exports.addDescription = async (req, res) => {
  const { description } = req.body;

  // project id
  const { id } = req.query;
  const userId = req.userId;

  if (!id) {
    return res.status(400).send({ message: "Project id is required" });
  }
  // user id
  if (!userId) {
    return res.status(400).send({ message: "Invalid UserId" });
  }
  if (!description) {
    return res.status(400).send({ message: "Description is required" });
  }

  try {
    const project = await Project.findOne({
      where: { id },
    });
    if (!project) {
      return res.status(400).send({ message: "Project not found" });
    }
    const user = await User.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    let addDescription = await Description.create({
      ProjectId: id,
      UserId: userId,
      description: req.body.description,
    });
    console.log("addDescription---->", addDescription);

    console.log("addDescription---->", addDescription);
    return res.status(200).send(addDescription);
  } catch (error) {
    return res
      .status(500)
      .send("Error while adding description to project: " + error.message);
  }
};

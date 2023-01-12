const { user } = require("../../models");
const db = require("../../models");
const User = db.user;
const Project = db.Project;
const UserProject = db.User_Project;
const Description = db.description;

exports.getDescription = async (req, res) => {
  const userId = req.userId;
  const { id } = req.query;
  if (!id) {
    return res.status(400).send({ message: "Project id is required" });
  }

  if (!userId) {
    return res.status(400).send({ message: "Invalid UserId" });
  }

  try {
    // get last description of user
    let userProject = await UserProject.findOne({
      where: { UserId: userId, ProjectId: id },
      include: [
        {
          model: Description,
        },
      ],
    });
    // return only last description
    let description = userProject.Descriptions;
    if (!description) {
      return res.status(200).send({ message: "No description found" });
    }
    if (!userProject) {
      return res.status(400).send({ message: "Invalid ProjectId" });
    }
    let lastDescription = description.pop();

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
  // if (!description) {
  //   return res.status(400).send({ message: "Description is required" });
  // }
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
    let userProject = await UserProject.findOne({
      where: { userId: userId, projectId: id },
    });
    // add description to description table and return description
    userProject = await userProject.createDescription({
      description: description,
    });
    return res.status(200).send(userProject);
  } catch (error) {
    return res
      .status(500)
      .send("Error while adding description to project: " + error.message);
  }
};

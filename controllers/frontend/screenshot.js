const { user } = require("../../models");
const db = require("../../models");
const User = db.User;
const Project = db.Project;
const UserProject = db.User_Project;
const Screenshot = db.screenshot;

exports.addScreenshot = async (req, res) => {
  const photo = req.file;

  const { id } = req.query;
  const userId = req.userId;

  const { keyboardEvent, mouseEvent, duration } = req.body;
  if (!duration) {
    return res.status(400).send({ message: "Duration is required" });
  }
  if (!id) {
    return res.status(400).send({ message: "Project id is required" });
  }
  // user id
  if (!userId) {
    return res.status(400).send({ message: "Invalid UserId" });
  }
  if (!photo) {
    return res.status(400).send({ message: "Photo is required" });
  }
  if (!keyboardEvent) {
    return res.status(400).send({ message: "KeyboardEvent is required" });
  }
  if (!mouseEvent) {
    return res.status(400).send({ message: "MouseEvent is required" });
  }
  // console.log("id", id, "userId", userId, "photo", photo);

  try {
    let userProject = await UserProject.findOne({
      where: { userId: userId, projectId: id },
    });
    // add screnshot with photo
    if (!userProject) {
      return res.status(400).send({ message: "UserProject not found" });
    }
    userProject = await userProject.createScreenshot({
      imgPath: photo.path,
      keyboardEvents: keyboardEvent,
      mouseEvents: mouseEvent,
      duration: duration,
    });

    return res.status(200).send(userProject);
  } catch (error) {
    return res
      .status(500)
      .send("Error while adding description to project: " + error.message);
  }
};

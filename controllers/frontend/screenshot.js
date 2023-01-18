const { user } = require("../../models");
const db = require("../../models");
const User = db.User;
const Project = db.Project;
const UserProject = db.User_Project;
const Screenshot = db.screenshot;
const Description = db.description;
const moment = require("moment");

exports.addScreenshot = async (req, res) => {
  const photo = req.file;
  const { id } = req.query;
  const userId = req.userId;

  const { keyboardEvent, mouseEvent, duration, TimeOfCapture, DescriptionId } =
    req.body;
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
  if (!TimeOfCapture) {
    return res.status(400).send({ message: "TimeOfCapture is required" });
  }
  // check TimeOfCapture is valid sequelize date format
  if (!moment(TimeOfCapture, moment.ISO_8601, true).isValid()) {
    return res.status(400).send({ message: "TimeOfCapture is not valid" });
  }

  // check if this DescriptionId is belongs to this user and project
  if (DescriptionId) {
    const description = await Description.findOne({
      where: {
        id: DescriptionId,
        UserId: userId,
        ProjectId: id,
      },
    });
    if (!description) {
      return res
        .status(400)
        .send({ message: "DescriptionId not belong to this user project" });
    }
  }

  try {
    // add screnshot where ProjectId = id and UserId = userId
    const screenshot = await Screenshot.create({
      ProjectId: id,
      UserId: userId,
      imgPath: photo.path,
      keyboardEvents: keyboardEvent,
      mouseEvents: mouseEvent,
      duration: duration,
      TimeOfCapture: TimeOfCapture,
      DescriptionId: DescriptionId,
    });
    console.log("screenshot--->", screenshot);

    return res.status(200).send({
      message: "Screenshot added successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .send("Error while adding description to project: " + error.message);
  }
};

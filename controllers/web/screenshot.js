const db = require("../../models");
const Screenshot = db.screenshot;
const Project = db.Project;
const User = db.User;
const UserProject = db.User_Project;
const Sequelize = require("sequelize");

exports.getScreenshot = async (req, res) => {
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();
  let screenshots = await Screenshot.findAll({
    where: { ...req.query },
  });

  return res.status(200).send(screenshots);
};

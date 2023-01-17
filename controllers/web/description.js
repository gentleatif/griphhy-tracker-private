const db = require("../../models");
const Project = db.Project;
const User = db.User;
const UserProject = db.User_Project;
const Description = db.description;
const Sequelize = require("sequelize");

exports.getDescription = async (req, res) => {
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();
  let descriptions = await Description.findAll({
    where: { ...req.query },
  });

  return res.status(200).send(descriptions);
};

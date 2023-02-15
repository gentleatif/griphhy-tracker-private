const db = require("../../models");
const Screenshot = db.screenshot;
const Sequelize = require("sequelize");
const Description = db.description;
const { filePublicUrl } = require("../../config/s3");

exports.getScreenshot = async (req, res) => {
  const Op = Sequelize.Op;
  const TODAY_START = new Date().setHours(0, 0, 0, 0);
  const NOW = new Date();
  // search screenshot on particular date
  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    req.query.TimeOfCapture = {
      [Op.between]: [date, nextDay],
    };
    delete req.query.date;
  }

  let screenshots = await Screenshot.findAll({
    where: { ...req.query },
    // populate description table
    // get descriptionId
    // remove description table from screenshot table
    include: [
      {
        model: Description,
        attributes: ["id", "description"],
      },
    ],
    attributes: {
      exclude: ["DescriptionId"],
    },
  });
  // adding description in screenshot table ddasdsdsdsads
  screenshots = screenshots.map((screenshot) => {
    screenshot = screenshot.toJSON();

    screenshot.imgPath = `${filePublicUrl}${screenshot.imgPath}`;

    if (screenshot.Description != null) {
      screenshot.description = screenshot.Description.description;
    } else {
      screenshot.description = "";
    }
    delete screenshot.Description;

    return screenshot;
  });

  return res.status(200).send(screenshots);
};

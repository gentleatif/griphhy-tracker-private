module.exports = (sequelize, Sequelize) => {
  const Screenshot = sequelize.define("Screenshot", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imgPath: {
      type: Sequelize.STRING,
    },
    keyboardEvents: {
      type: Sequelize.STRING,
    },
    mouseEvents: {
      type: Sequelize.STRING,
    },
    duration: {
      type: Sequelize.INTEGER,
    },
    // save both date and time
    TimeOfCapture: {
      type: Sequelize.DATE,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    DescriptionId: {
      type: Sequelize.INTEGER,
    },
  });

  return Screenshot;
};

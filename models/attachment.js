module.exports = (sequelize, Sequelize) => {
  const Attachment = sequelize.define("Attachment", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    imgPath: {
      type: Sequelize.STRING,
    },
  });
  return Attachment;
};

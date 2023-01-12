module.exports = (sequelize, Sequelize) => {
  const User_ProjectScreenshot = sequelize.define("User_ProjectScreenshot", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  return User_ProjectScreenshot;
};

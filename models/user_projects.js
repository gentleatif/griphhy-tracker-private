module.exports = (sequelize, Sequelize) => {
  const User_Project = sequelize.define("User_Project", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  return User_Project;
};

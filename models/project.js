module.exports = (sequelize, Sequelize) => {
  const Project = sequelize.define("Project", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    subtitle: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.BOOLEAN,
      default: 1,
    },
  });
  return Project;
};

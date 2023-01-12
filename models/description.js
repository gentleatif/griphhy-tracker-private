module.exports = (sequelize, Sequelize) => {
  const Description = sequelize.define("Description", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: Sequelize.STRING,
    },
  });
  return Description;
};

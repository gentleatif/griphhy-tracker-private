const dbConfig = require("../config/dbConfig.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    logging: dbConfig.logging,

    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user.js")(sequelize, Sequelize);
db.Project = require("./project.js")(sequelize, Sequelize);
db.attachment = require("./attachment.js")(sequelize, Sequelize);
db.User_Project = require("./user_projects")(sequelize, Sequelize);
db.description = require("./description.js")(sequelize, Sequelize);
db.user_description = require("./user_projects.js")(sequelize, Sequelize);
db.screenshot = require("./screenshot.js")(sequelize, Sequelize);

module.exports = db;

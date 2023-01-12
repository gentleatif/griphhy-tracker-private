module.exports = {
  host: "localhost",
  user: "root",
  password: "a82268T@",
  database: "griphhydb",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    logging: true,
  },
};

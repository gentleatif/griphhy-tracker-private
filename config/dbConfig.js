module.exports = {
  host: "localhost",
  user: "root",
  password: "a82268T@",
  database: "griphhyInternalSysDB",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    logging: 1,
  },
};

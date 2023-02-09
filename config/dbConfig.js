module.exports = {
  host: "bqfg4hjfzkl3ffamw163-mysql.services.clever-cloud.com",
  user: "uqdrnrakw4zg5jkw",
  password: "0QEZwEw9DtniHCcwy5jj",
  database: "bqfg4hjfzkl3ffamw163",
  dialect: "mysql",
  // add port number
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    logging: 1,
  },
};

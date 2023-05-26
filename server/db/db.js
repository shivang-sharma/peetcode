const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "peetcode_password",
  database: "peetcode",
});

module.exports = { mysqlPool: pool };

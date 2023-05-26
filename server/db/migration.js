const { mysqlPool } = require("./db");
const {
  userSchema,
  languageSchema,
  problemSchema,
  submissionSchema,
} = require("./migrations/schema");

const { userData, languageData, problemData } = require("./migrations/data");

module.exports = {
  migrateSchema: function () {
    mysqlPool.getConnection((err, connection) => {
      if (err) {
        console.error(err);
        return;
      }
      connection.query(userSchema, (err, rows, fields) => {
        if (err) {
          console.error(err);
          connection.release();
          return;
        }
        console.log(rows);
        console.log(fields);
        connection.query(languageSchema, (err, rows, fields) => {
          if (err) {
            console.error(err);
            connection.release();
            return;
          }
          console.log(rows);
          console.log(fields);
          connection.query(problemSchema, (err, rows, fields) => {
            if (err) {
              console.error(err);
              connection.release();
              return;
            }
            console.log(rows);
            console.log(fields);
            connection.query(submissionSchema, (err, rows, fields) => {
              if (err) {
                console.error(err);
                connection.release();
                return;
              }
              console.log(rows);
              console.log(fields);
              connection.release();
            });
          });
        });
      });
    });
  },
  migrateSeed: function () {
    mysqlPool.getConnection((err, connection) => {
      if (err) {
        console.error(err);
        connection.release();
        return;
      }
      for (let query of userData) {
        connection.query(query);
      }
      for (let query of languageData) {
        connection.query(query);
      }
      for (let query of problemData) {
        connection.query(query);
      }
      connection.release();
    });
  },
};

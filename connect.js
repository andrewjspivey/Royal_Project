const sql = require('mssql'); 
const dotenv = require('dotenv')
dotenv.config()
var config = require('./config')

// const config = {
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     server: process.env.DATABASE_SERVER,
//     database: process.env.DATABASE_NAME
// }
var connection = new sql.ConnectionPool(config);


connection.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected');
  }
});
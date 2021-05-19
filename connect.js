const sql = require('mssql'); 
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv')
dotenv.config()
var config = require('./config')

var dbConnect = () => {
  
  new sql.connect(config,function(err)
  {
    if(err){
      console.log("Error while connecting database: " + err)
    }else{
      console.log("connected to database: " + config.server)
    }
  }
  )
}

dbConnect()

// const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
//   host: 'localhost',
//   dialect: 'mssql',
//   port: 1433,
// });

// var dbConnect = async () => {
  
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }

// dbConnect()





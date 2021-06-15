const sql = require('mssql/msnodesqlv8'); 
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







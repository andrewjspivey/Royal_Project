

const dotenv = require('dotenv')
dotenv.config()

const config = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    database: process.env.DATABASE_NAME,
    options: {
        useUTC: false
    }
};
module.exports = config
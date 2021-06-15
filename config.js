

const dotenv = require('dotenv')
dotenv.config()

const config = {
    server: process.env.DATABASE_SERVER,
    port: 1433,
    database: process.env.DATABASE_NAME,
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true,
        useUTC: false
    }
};
module.exports = config
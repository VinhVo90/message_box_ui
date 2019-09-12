const path = require('path')
const dotenv = require('dotenv')
const Sequelize = require('sequelize-oracle')
const dbConfig = require('../configs/db.js');

const NODE_ENV = process.env.NODE_ENV || 'developement'
if (NODE_ENV == 'developement'){
    dotenv.config({path: path.join(__dirname, '..', '.env')})
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'oracle',
    pool: {
        maxConnections: 100,
        minConnections: 0,
        maxIdelTime: 1000
    }
})

const db = {}

db.sequelize = sequelize

module.exports = db
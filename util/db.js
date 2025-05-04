const Sequelize = require('sequelize')
const { DATABASE_URL } = require('./config')
const fs = require('fs')

const sequelize = new Sequelize(DATABASE_URL, {
    //                                 filename,    data;\n
  logging: (sql) => fs.appendFileSync('../commands.sql', sql + '\n'),
  pool: {
    max: 5,
    min: 1,
    idle: 600000 // To get server stay on
  }
})

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('database connected')
    await sequelize.sync()
  } catch (err) {
    console.log('connecting database failed')
    return process.exit(1)
  }

  return null
}

module.exports = { connectToDatabase, sequelize }

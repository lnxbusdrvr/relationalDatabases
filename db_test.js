require('dotenv').config()
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ Yhteys tietokantaan onnistui!')
  } catch (error) {
    console.error('❌ Yhteys epäonnistui:', error)
  } finally {
    await sequelize.close()
  }
}

testConnection()


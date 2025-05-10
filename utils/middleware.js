const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')
const logger = require('./logger')
const { User, Session } = require('../models')


const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    try {
      const token = authorization.substring(7)
      const decodedToken = jwt.verify(token, SECRET)

      const session = await Session.findOne({ where: { token } })
      if (!session) {
        return res.status(401).json({ error: 'session expired or invalid' })
      }

      const user = await User.findByPk(decodedToken.id)
      if (user.disabled) {
        return res.status(403).json({ error: 'account is disabled' })
      }

      req.user = user
      req.token = token
    } catch {
      return res.status(401).json({ error: 'invalid token' })
    }
  }

  next()
}

const userExtractor = async (req, res, next) => {
  const decodedToken = jwt.verify( req.token, SECRET)

  req.user = await User.findByPk(decodedToken.id)

  next()
}


const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.errors.map(e => e.message) })
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'Unique constraint failed' })
  } else if (error.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: error.message })
  }

  return res.status(500).json({ error: 'internal server error' })
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor 
}


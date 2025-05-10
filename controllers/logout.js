const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { Session } = require('../models')
const { tokenExtractor } = require('../utils/middleware')
const { SECRET } = require('../utils/config')

router.delete('/', tokenExtractor, async (req, res) => {
  const authorization = req.get('authorization')
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const token = authorization.substring(7)

  let decodedToken
  try {
    decodedToken = jwt.verify(token, SECRET)
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }

  await Session.destroy({
    where: { token }
  })

  res.status(204).end()
})

module.exports = router


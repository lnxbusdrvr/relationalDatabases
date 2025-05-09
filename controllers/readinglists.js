const router = require('express').Router()
const ReadingList = require('../models/reading_list')

router.post('/', async (req, res) => {
  const { user_id, blog_id } = req.body
  const entry = await ReadingList.create({ user_id, blog_id })
  res.json(entry)
})

module.exports = router


const router = require('express').Router()
const { ReadingList, User, Blog } = require('../models')
const { tokenExtractor, userExtractor } = require('../utils/middleware')

router.post('/', async (req, res) => {
  const { user_id, blog_id } = req.body
  const entry = await ReadingList.create({ user_id, blog_id })
  res.json(entry)
})

router.put('/:id', tokenExtractor, userExtractor, async (req, res) => {
  const readingListEntry = await ReadingList.findByPk(req.params.id)

  if (!readingListEntry )
    return res.status(404).json({ error: 'Reading list entry not found' })

  if (readingListEntry.user_id !== req.user.id)
    return res.status(403).json({ error: 'You can only update your own blog' })

  readingListEntry.read = req.body.read
  await readingListEntry.save()
  res.json(readingListEntry)
})

module.exports = router


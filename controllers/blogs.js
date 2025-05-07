const router = require('express').Router()
const { Blog, User } = require('../models')
const { tokenExtractor, userExtractor } = require('../util/middleware')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId']},
    include: {
      model: User,
      attributes: ['name']
    }
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, userExtractor, async (req, res) => {
  try {
    const blog = await Blog.create({
      ...req.body,
      userId: req.user.id
    })
    res.json(blog)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.get('/:id', blogFinder, async (req, res) => {
  const blog = req.blog

  if (blog) {
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', blogFinder, async (req, res) => {
  const blog = req.blog

  if (blog) {
    await blog.destroy()
  }
  res.status(204).end()
})

router.put('/:id', blogFinder, async (req, res) => {
  const blog = req.blog
  const body = req.body

  if (blog) {
    blog.likes = body.likes ?? body.likes

    await blog.save()
    res.json(blog)
  } else {
    res.status(404).end()
  }
})


module.exports = router

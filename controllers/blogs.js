const router = require('express').Router()
const { Op } = require('sequelize')
const { Blog, User } = require('../models')
const { tokenExtractor, userExtractor } = require('../util/middleware')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id,{
    include: {
      model: User,
      attributes: ['id', 'name']
    }
  })
  next()
}

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    const search = `%${req.query.search}%`
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: search
        }
      },
      {
        author: {
          [Op.iLike]: search
        }
      }
    ]
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId']},
    include: {
      model: User,
      attributes: ['id', 'name','username']
    },
    order: [
      ['likes', 'DESC']
    ],
    where
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

router.delete('/:id', tokenExtractor, userExtractor, blogFinder, async (req, res) => {
  const blog = req.blog

  if (blog && blog.user.id === req.user.id) {
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

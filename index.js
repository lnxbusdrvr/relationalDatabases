require('dotenv').config()
const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize');
const express = require('express')
const app = express()
const fs = require('fs')

//Sava to commands.sql:
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    //                                 filename,    data;\n
  logging: (sql) => fs.appendFileSync('commands.sql', sql + '\n'),
  pool: {
    max: 5,
    min: 1,
    idle: 600000 // To get server stay on
  }
})

class Blog extends Model {}

Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'blog'
})

app.use(express.json())

app.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.findAll()
  res.json(blogs)
})

app.post('/api/blogs', async (req, res) => {
  try {
    const blog = await Blog.create(req.body)
    return res.json(blog)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id)
    if (!blog) {
      // if someone is alreade deleted this blog
      return res.status(404).json({ error: 'Blog not found' })
    }
    await blog.destroy()
    return res.status(204).end()
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

const PORT = process.env.PORT || 3001

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to database established succesfully.');

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Connection to database failed:', error);
  }
};


main();
/* NB! No need for sequalize.close() */

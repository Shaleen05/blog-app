import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import Post from './models/Post.js';
import authRouter from './routes/auth.js';
import { authenticateToken } from "./controllers/auth.controller.js";

dotenv.config();

const app = express();
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.get('/', (req, res) => res.render('signin'));
app.get('/signup', (req, res) => res.render('signup'));

// Home Route
app.get('/home', authenticateToken, async (req, res) => {
  const posts = await Post.find();
  res.render('index', { posts: posts });
});

// New Post Route
app.get('/new', authenticateToken, (req, res) => res.render('new'));

// Editor Route
app.get('/editor', authenticateToken, async (req, res) => {
  const posts = await Post.find();
  res.render('view', { posts: posts });
});

// Create Post Route
app.post('/posts', authenticateToken, async (req, res) => {
  const newPost = {
    id: Date.now().toString(),
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    content: req.body.content
  };
  await Post.create(newPost);
  res.redirect('/home');
});

// Single Post Route
app.get('/posts/:id', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.render('post', { post });
  } else {
    res.status(404).send('Post not found');
  }
});

// Edit Post Route
app.get('/posts/edit/:id', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit', { post });
});

// Update Post Route
app.post('/posts/update/:id', authenticateToken, async (req, res) => {
  const { title, imageUrl, content } = req.body;
  try {
    await Post.findByIdAndUpdate(req.params.id, { title, imageUrl, content });
    res.redirect('/home');
  } catch (err) {
    console.log('Post update failed:', err);
    res.status(400).json({ message: 'Post update failed' });
  }
});

// Delete Post Route
app.post('/posts/delete/:id', authenticateToken, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/home');
});

// Database Connection and Server Start
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('Database connection error:', err));

app.listen(port, () => console.log(`Listening on port ${port}`));

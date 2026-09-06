require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// --- Chatbot Route ---
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Je n'ai pas pu générer de réponse.";
    res.json({ reply });
  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to AI',
      details: error.message || "Unknown error"
    });
  }
});

// --- Annonces Routes ---
app.get('/api/annonces', (req, res) => {
  const annonces = db.prepare('SELECT * FROM annonces ORDER BY createdAt DESC').all();
  res.json(annonces);
});

app.post('/api/annonces', (req, res) => {
  const { title, description, price, location } = req.body;
  const info = db.prepare('INSERT INTO annonces (title, description, price, location) VALUES (?, ?, ?, ?)').run(title, description, price, location);
  res.json({ id: info.lastInsertRowid });
});

// --- Favorites Routes ---
app.get('/api/favorites', (req, res) => {
  const favorites = db.prepare('SELECT * FROM favorites ORDER BY createdAt DESC').all();
  res.json(favorites);
});

app.post('/api/favorites', (req, res) => {
  const { courseId, courseTitle } = req.body;
  const info = db.prepare('INSERT INTO favorites (courseId, courseTitle) VALUES (?, ?)').run(courseId, courseTitle);
  res.json({ id: info.lastInsertRowid });
});

// --- Projects Routes ---
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const { title, description, techStack, author, link } = req.body;
  const info = db.prepare('INSERT INTO projects (title, description, techStack, author, link) VALUES (?, ?, ?, ?, ?)').run(title, description, techStack, author, link);
  res.json({ id: info.lastInsertRowid });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
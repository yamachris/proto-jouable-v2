import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static('dist'));

// Initialize SQL.js database
let db;

async function initializeDatabase() {
  try {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        state JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

// Initialize database
initializeDatabase();

// API Routes
app.post('/api/games', async (req, res) => {
  try {
    const { gameState } = req.body;
    const gameId = Math.random().toString(36).substr(2, 9);
    
    db.run(
      'INSERT INTO games (id, state) VALUES (?, ?)',
      [gameId, JSON.stringify(gameState)]
    );
    
    res.json({ gameId });
  } catch (err) {
    console.error('Error saving game:', err);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = db.exec(
      'SELECT state FROM games WHERE id = ? ORDER BY created_at DESC LIMIT 1',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ gameState: JSON.parse(result[0].values[0][0]) });
  } catch (err) {
    console.error('Error loading game:', err);
    res.status(500).json({ error: 'Failed to load game' });
  }
});

// Catch all routes and serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('gameAction', (data) => {
    // Broadcast game action to other players
    socket.broadcast.to(data.gameId).emit('gameUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
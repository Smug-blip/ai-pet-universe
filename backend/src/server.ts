import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app: Express = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Backend is running' });
});

// User Routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email, username, password]
    );
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Companion Routes
app.get('/api/companions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM companions WHERE owner_id = $1',
      [userId]
    );
    
    res.json({ companions: result.rows });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/companions', async (req: Request, res: Response) => {
  try {
    const { owner_id, name, species } = req.body;
    
    const result = await pool.query(
      'INSERT INTO companions (owner_id, name, species) VALUES ($1, $2, $3) RETURNING *',
      [owner_id, name, species]
    );
    
    res.json({ companion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
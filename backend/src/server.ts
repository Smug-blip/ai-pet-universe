import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app: Express = express();

console.log('🚀 Initializing Express app...');

// Initialize pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/ai_pet_universe',
});

console.log('📦 Pool created');

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Middleware
app.use(cors());
console.log('✅ CORS middleware added');

app.use(express.json());
console.log('✅ JSON middleware added');

// JWT verification middleware
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).userId = (decoded as any).id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  console.log('📍 Health check endpoint called');
  res.json({ status: 'Backend is running' });
});

console.log('✅ Health endpoint registered');

// User Routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email, username, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ 
      user: { id: user.id, email: user.email, username: user.username },
      token 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/auth/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      'SELECT id, email, username FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('❌ Auth me error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Companion Routes
app.get('/api/companions/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM companions WHERE owner_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ companions: result.rows });
  } catch (error) {
    console.error('❌ Get companions error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/companions', verifyToken, async (req: Request, res: Response) => {
  try {
    const { owner_id, name, species } = req.body;
    const userId = (req as any).userId;

    if (!owner_id || !name || !species) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (parseInt(owner_id) !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const result = await pool.query(
      'INSERT INTO companions (owner_id, name, species) VALUES ($1, $2, $3) RETURNING *',
      [owner_id, name, species]
    );
    
    res.json({ companion: result.rows[0] });
  } catch (error) {
    console.error('❌ Create companion error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

console.log('✅ All routes registered');

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
console.log(`\n⏳ Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ SERVER IS RUNNING ON PORT ${PORT}`);
  console.log(`📍 Try: http://localhost:${PORT}/api/health`);
  console.log(`Database URL: ${process.env.DATABASE_URL || 'Not set'}\n`);
});

server.on('error', (err: any) => {
  console.error('❌ Server error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');
const JWT_SECRET = process.env.JWT_SECRET || 'mktai-secret-key-123';

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
if (!fs.existsSync(LICENSES_FILE)) fs.writeFileSync(LICENSES_FILE, JSON.stringify([]));

const readData = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeData = (file: string, data: any) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // User Auth
  app.post('/api/auth/signup', async (req, res) => {
    const { username, password } = req.body;
    const users = readData(USERS_FILE);
    
    if (users.find((u: any) => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), username, password: hashedPassword, license: null };
    users.push(newUser);
    writeData(USERS_FILE, users);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
    res.json({ token, user: { username: newUser.username, license: null } });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readData(USERS_FILE);
    const user = users.find((u: any) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { username: user.username, license: user.license } });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const users = readData(USERS_FILE);
    const user = users.find((u: any) => u.id === req.user.id);
    if (!user) return res.sendStatus(404);
    res.json({ user: { username: user.username, license: user.license } });
  });

  // Licenses (Admin)
  app.get('/api/admin/licenses', (req, res) => {
    // In a real app, check admin token here
    res.json(readData(LICENSES_FILE));
  });

  app.get('/api/admin/users', (req, res) => {
    const users = readData(USERS_FILE);
    // Remove passwords before sending
    const sanitizedUsers = users.map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(sanitizedUsers);
  });

  app.post('/api/admin/licenses', (req, res) => {
    const licenses = readData(LICENSES_FILE);
    const newLicense = { ...req.body, id: Date.now().toString(), claims: 0, createdAt: new Date().toISOString() };
    licenses.push(newLicense);
    writeData(LICENSES_FILE, licenses);
    res.json(newLicense);
  });

  app.delete('/api/admin/licenses/:id', (req, res) => {
    let licenses = readData(LICENSES_FILE);
    licenses = licenses.filter((l: any) => l.id !== req.params.id);
    writeData(LICENSES_FILE, licenses);
    res.sendStatus(200);
  });

  // License Validation (User)
  app.post('/api/license/activate', authenticateToken, (req: any, res) => {
    const { key } = req.body;
    const licenses = readData(LICENSES_FILE);
    const users = readData(USERS_FILE);
    
    const license = licenses.find((l: any) => l.key === key);
    if (!license) return res.status(404).json({ error: 'Invalid license key' });
    if (license.claims >= license.maxClaims) return res.status(400).json({ error: 'License capacity reached' });

    license.claims += 1;
    writeData(LICENSES_FILE, licenses);

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + license.days);
    
    const user = users.find((u: any) => u.id === req.user.id);
    user.license = { key, expiry: expiry.toISOString() };
    writeData(USERS_FILE, users);

    res.json({ license: user.license });
  });

  // --- Vite Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

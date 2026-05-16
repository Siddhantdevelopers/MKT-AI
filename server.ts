import express from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mktai-secret-key-123';

export async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

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

  const apiRouter = express.Router();

  // Health Check
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // User Auth
  apiRouter.post('/auth/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Date.now().toString();
      const newUser = { 
        id: userId, 
        username, 
        password: hashedPassword, 
        license: null,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userId), newUser);

      const token = jwt.sign({ id: userId, username }, JWT_SECRET);
      res.json({ token, user: { username, license: null } });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Internal server error during signup' });
    }
  });

  apiRouter.post('/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data();

      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token, user: { username: user.username, license: user.license } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  apiRouter.get('/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', req.user.id));
      if (!userDoc.exists()) return res.sendStatus(404);
      const user = userDoc.data();
      res.json({ user: { username: user.username, license: user.license } });
    } catch (err) {
      console.error('Auth me error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Licenses (Admin)
  apiRouter.get('/admin/licenses', async (req, res) => {
    try {
      const licensesSnapshot = await getDocs(collection(db, 'licenses'));
      const licenses = licensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(licenses);
    } catch (err) {
      console.error('Error reading licenses:', err);
      res.status(500).json({ error: 'Failed to read licenses' });
    }
  });

  apiRouter.get('/admin/users', async (req, res) => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        const { password, ...rest } = data;
        return { id: doc.id, ...rest };
      });
      res.json(users);
    } catch (err) {
      console.error('Error reading users:', err);
      res.status(500).json({ error: 'Failed to read users' });
    }
  });

  apiRouter.post('/admin/licenses', async (req, res) => {
    try {
      const { key, days, maxClaims } = req.body;
      
      if (!key || !days || !maxClaims) {
        return res.status(400).json({ error: 'Missing required license fields' });
      }

      const licenseId = Date.now().toString();
      const newLicense = { 
        key,
        days: Number(days),
        maxClaims: Number(maxClaims),
        claims: 0,
        claimantIds: [],
        createdAt: new Date().toISOString() 
      };
      
      await setDoc(doc(db, 'licenses', licenseId), newLicense);
      res.json({ id: licenseId, ...newLicense });
    } catch (err) {
      console.error('Error provisioning license:', err);
      res.status(500).json({ error: 'Internal server error during provisioning' });
    }
  });

  apiRouter.delete('/admin/licenses/:id', async (req, res) => {
    try {
      await deleteDoc(doc(db, 'licenses', req.params.id));
      res.sendStatus(200);
    } catch (err) {
      console.error('Error deleting license:', err);
      res.status(500).json({ error: 'Failed to delete license' });
    }
  });

  // License Validation (User)
  apiRouter.post('/license/activate', authenticateToken, async (req: any, res) => {
    try {
      const { key } = req.body;
      
      const licensesRef = collection(db, 'licenses');
      const q = query(licensesRef, where('key', '==', key));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return res.status(404).json({ error: 'Invalid license key' });

      const licenseDoc = querySnapshot.docs[0];
      const license = licenseDoc.data();
      const licenseId = licenseDoc.id;

      const userDocRef = doc(db, 'users', req.user.id);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) return res.status(404).json({ error: 'User not found' });
      const user = userDoc.data();

      // If user already has THIS license and it's not expired, just return it
      if (user.license && user.license.key === key) {
        const expiry = new Date(user.license.expiry);
        if (expiry > new Date()) {
          return res.json({ license: user.license });
        }
      }

      // Check capacity
      const isAlreadyClaimant = license.claimantIds?.includes(req.user.id);
      if (!isAlreadyClaimant && license.claims >= license.maxClaims) {
        return res.status(400).json({ error: 'License capacity reached: This key has been used by all allowed accounts.' });
      }

      // Increment claims if it's a new account
      if (!isAlreadyClaimant) {
        const newClaimantIds = [...(license.claimantIds || []), req.user.id];
        await updateDoc(doc(db, 'licenses', licenseId), {
          claims: (license.claims || 0) + 1,
          claimantIds: newClaimantIds
        });
      }

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + license.days);
      const expiryStr = expiry.toISOString();
      
      await updateDoc(userDocRef, {
        license: { key, expiry: expiryStr }
      });

      res.json({ license: { key, expiry: expiryStr } });
    } catch (err) {
      console.error('License activation error:', err);
      res.status(500).json({ error: 'Internal server error during activation' });
    }
  });

  // Mount API router
  app.use(['/api', '/'], apiRouter);

  // API 404 handler
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

// --- Vite Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// Support for standalone execution (Cloud Run, local)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  createServer().then(app => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}


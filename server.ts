import express from 'express';
import 'express-async-errors';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import path from 'path';
import pool, { initializeDb } from './server/db.js';
import multer from 'multer';

const ADMIN_PASSWORD = 'admin'; // Hardcoded for demo purposes

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type as string;
    let dest = 'public/uploads/';
    if (type === 'director') dest += 'directors/';
    else if (type === 'client') dest += 'clients/';
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Try to initialize DB, but don't crash if it fails
  initializeDb().then(() => {
    console.log('Database connected and initialized successfully.');
  }).catch(e => {
    console.error('===================================================');
    console.error('DATABASE CONNECTION ERROR:');
    console.error('Failed to connect to MySQL database:', e.message);
    console.error('Environment variables being used:');
    console.error('DB_HOST:', process.env.DB_HOST);
    console.error('DB_USER:', process.env.DB_USER);
    console.error('DB_NAME:', process.env.DB_NAME);
    console.error('Please verify your environment variables in the App Settings/Plesk.');
    console.error('===================================================');
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  // --- API Routes ---
  
  app.get('/api/setup-db', async (req, res) => {
    try {
      await initializeDb();
      res.json({ success: true, message: 'Database initialized successfully!' });
    } catch (error: any) {
      console.error("Setup DB Error:", error);
      res.status(500).json({ error: error.message, stack: error.stack, code: error.code });
    }
  });

  app.post('/api/admin/login', async (req, res) => {
    let { username = 'admin', password, token } = req.body;
    
    // Add validation
    if (!username || typeof username !== 'string' || username.length > 50 || username.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid username' });
    }
    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (token && (typeof token !== 'string' || token.length > 20)) {
       return res.status(400).json({ error: 'Invalid token format' });
    }

    username = username.trim();

    try {
      console.log('Login attempt for:', username);
      const [adminRows] = await pool.query<any>('SELECT * FROM admins WHERE username = ?', [username]);
      
      // Check if we received a mock response (database connection failed)
      if (adminRows.length > 0 && adminRows[0].count !== undefined && adminRows[0].username === undefined) {
        console.log('Mock fallback response detected');
        return res.status(500).json({ error: 'Database connection failed. Please check your connection or initialize the database via setup.' });
      }

      if (adminRows.length === 0) {
        console.log('Admin user not found');
        return res.status(401).json({ error: 'Admin username not found' });
      }
      
      const adminUser = adminRows[0];
      
      // To support tables that haven't been altered yet, fall back to password_hash if password column doesn't exist
      const storedPassword = adminUser.password || adminUser.password_hash;
      const validPassword = (password === storedPassword);
      
      console.log('Password valid:', validPassword);
      
      if (validPassword) {
        // Check if 2FA is enabled
        const is2faEnabled = adminUser.two_factor_enabled;

        if (is2faEnabled) {
          if (!token) {
            return res.status(401).json({ error: '2FA token required', require2fa: true });
          }
          
          const verified = speakeasy.totp.verify({
            secret: adminUser.two_factor_secret,
            encoding: 'base32',
            token: token
          });
          
          if (!verified) {
            return res.status(401).json({ error: 'Invalid 2FA token' });
          }
        } else {
          // Force 2FA setup on login
          let base32Secret = adminUser.two_factor_secret;
          
          if (!base32Secret) {
            const secret = speakeasy.generateSecret({ name: 'Printing Business Admin' });
            base32Secret = secret.base32;
            await pool.query('UPDATE admins SET two_factor_secret = ? WHERE username = ?', [base32Secret, username]);
          }

          if (!token) {
            const otpauth = `otpauth://totp/PrintingBusiness?secret=${base32Secret}`;
            const qrCodeUrl = await QRCode.toDataURL(otpauth);
            return res.status(401).json({ error: '2FA setup required', setup2fa: true, setup2faInfo: { qrCodeUrl, secret: base32Secret } });
          }

          // Verify initial token for setup
          const verified = speakeasy.totp.verify({
            secret: base32Secret,
            encoding: 'base32',
            token: token
          });

          if (!verified) {
            return res.status(401).json({ error: 'Invalid 2FA token' });
          }
          
          // Enable 2FA now
          await pool.query('UPDATE admins SET two_factor_enabled = TRUE WHERE username = ?', [username]);
        }

        res.cookie('admin_auth', 'true', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('admin_auth', { httpOnly: true });
    res.json({ success: true });
  });

  app.get('/api/admin/check', (req, res) => {
    if (req.cookies.admin_auth === 'true') {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Middleware to protect admin routes
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies.admin_auth === 'true') {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
  app.post('/api/upload', requireAdmin, upload.single('image'), (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const type = req.query.type as string;
    let url = `/uploads/`;
    if (type === 'director') url += `directors/${req.file.filename}`;
    else if (type === 'client') url += `clients/${req.file.filename}`;
    else url += `${req.file.filename}`;
    
    res.json({ url });
  });

  app.get('/api/admin/2fa/setup', requireAdmin, async (req, res) => {
    const username = 'admin';
    const [adminRows] = await pool.query<any>('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (adminRows.length === 0) return res.status(404).json({ error: 'Admin not found' });
    const adminUser = adminRows[0];
    
    if (adminUser.two_factor_enabled) {
      return res.json({ alreadyEnabled: true });
    }

    let base32Secret = adminUser.two_factor_secret;
    
    if (!base32Secret) {
      const secret = speakeasy.generateSecret({ name: 'Printing Business Admin' });
      base32Secret = secret.base32;
      await pool.query('UPDATE admins SET two_factor_secret = ? WHERE username = ?', [base32Secret, username]);
    }
    
    const otpauth = speakeasy.otpauthURL({ secret: base32Secret, label: 'Printing Business Admin', encoding: 'base32' });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    
    res.json({ qrCodeUrl, secret: base32Secret });
  });

  app.post('/api/admin/2fa/verify', requireAdmin, async (req, res) => {
    const { token } = req.body;
    const username = 'admin';
    const [adminRows] = await pool.query<any>('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (adminRows.length === 0) return res.status(404).json({ error: 'Admin not found' });
    const adminUser = adminRows[0];
    
    const verified = speakeasy.totp.verify({
      secret: adminUser.two_factor_secret,
      encoding: 'base32',
      token: token
    });
    
    if (verified) {
      await pool.query('UPDATE admins SET two_factor_enabled = TRUE WHERE username = ?', [username]);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
    const [productsRows] = await pool.query<any>('SELECT COUNT(*) as count FROM services');
    const [inquiriesRows] = await pool.query<any>('SELECT COUNT(*) as count FROM inquiries WHERE message LIKE "%Inquiry for%"');
    const [allInquiriesRows] = await pool.query<any>('SELECT COUNT(*) as count FROM inquiries');
    res.json({ 
      totalProducts: productsRows[0].count, 
      bulkInquiries: inquiriesRows[0].count,
      totalInquiries: allInquiriesRows[0].count
    });
  });

  app.get('/api/services/:id/variants', async (req, res) => {
    const [variants] = await pool.query<any>('SELECT * FROM product_variants WHERE service_id = ?', [req.params.id]);
    res.json(variants);
  });

  app.post('/api/services/:id/variants', requireAdmin, async (req, res) => {
    const { title, price, image_url } = req.body;
    const service_id = req.params.id;
    const [info] = await pool.query<any>('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [service_id, title, price, image_url || '']);
    res.json({ id: info.insertId });
  });

  app.delete('/api/services/:id/variants/:variantId', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM product_variants WHERE id = ? AND service_id = ?', [req.params.variantId, req.params.id]);
    res.json({ success: true });
  });

  app.put('/api/services/:id/variants/:variantId', requireAdmin, async (req, res) => {
    const { title, price, image_url } = req.body;
    await pool.query('UPDATE product_variants SET title = ?, price = ?, image_url = ? WHERE id = ? AND service_id = ?', [title, price, image_url || '', req.params.variantId, req.params.id]);
    res.json({ success: true });
  });

  // Services API
  app.get('/api/services', async (req, res) => {
    const [services] = await pool.query<any>('SELECT * FROM services ORDER BY id DESC');
    res.json(services);
  });

  app.get('/api/services/:id', async (req, res) => {
    const [serviceRows] = await pool.query<any>('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (serviceRows.length > 0) {
      res.json(serviceRows[0]);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  });

  app.get('/api/services/:id/reviews', async (req, res) => {
    const [reviews] = await pool.query<any>('SELECT * FROM product_reviews WHERE service_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(reviews);
  });

  app.post('/api/services/:id/reviews', async (req, res) => {
    let { reviewer_name, content, rating } = req.body;
    const service_id = req.params.id;
    
    if (!reviewer_name || typeof reviewer_name !== 'string' || reviewer_name.trim().length === 0 || reviewer_name.length > 255) {
      return res.status(400).json({ error: 'Valid reviewer name is required' });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
      return res.status(400).json({ error: 'Review content is required' });
    }
    
    reviewer_name = reviewer_name.trim();
    content = content.trim();
    rating = typeof rating === 'number' ? Math.max(1, Math.min(5, rating)) : 5;

    const [info] = await pool.query<any>('INSERT INTO product_reviews (service_id, reviewer_name, content, rating) VALUES (?, ?, ?, ?)', [service_id, reviewer_name, content, rating]);
    res.json({ id: info.insertId });
  });

  app.post('/api/services', requireAdmin, async (req, res) => {
    const { title, description, image_url, category, price } = req.body;
    const [info] = await pool.query<any>('INSERT INTO services (title, description, image_url, category, price) VALUES (?, ?, ?, ?, ?)', [title, description, image_url, category, price || '']);
    res.json({ id: info.insertId });
  });

  app.delete('/api/services/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Testimonials API
  app.get('/api/testimonials', async (req, res) => {
    const [testimonials] = await pool.query<any>('SELECT * FROM testimonials ORDER BY id DESC');
    res.json(testimonials);
  });

  app.post('/api/testimonials', requireAdmin, async (req, res) => {
    const { client_name, content, rating } = req.body;
    const [info] = await pool.query<any>('INSERT INTO testimonials (client_name, content, rating) VALUES (?, ?, ?)', [client_name, content, rating]);
    res.json({ id: info.insertId });
  });

  app.delete('/api/testimonials/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // About Counters API
  app.get('/api/about-counters', async (req, res) => {
    const [counters] = await pool.query<any>('SELECT * FROM about_counters');
    res.json(counters);
  });

  app.put('/api/about-counters', requireAdmin, async (req, res) => {
    const counters = req.body;
    if (Array.isArray(counters)) {
      for (const c of counters) {
        if (c.id && c.value !== undefined) {
          await pool.query('UPDATE about_counters SET value = ?, label = ? WHERE id = ?', [c.value, c.label, c.id]);
        }
      }
    }
    res.json({ success: true });
  });

  // Directors API
  app.get('/api/directors', async (req, res) => {
    const [directors] = await pool.query<any>('SELECT * FROM directors');
    res.json(directors);
  });

  app.put('/api/directors', requireAdmin, async (req, res) => {
    const directors = req.body;
    if (Array.isArray(directors)) {
      for (const d of directors) {
        if (d.id) {
          await pool.query('UPDATE directors SET name = ?, role = ?, image_url = ?, bio = ? WHERE id = ?', [d.name, d.role, d.image_url, d.bio, d.id]);
        }
      }
    }
    res.json({ success: true });
  });

  // Clients API
  app.get('/api/clients', async (req, res) => {
    const [clients] = await pool.query<any>('SELECT * FROM clients');
    res.json(clients);
  });

  app.post('/api/clients', requireAdmin, async (req, res) => {
    const { name, image_url, description, website } = req.body;
    const [info] = await pool.query<any>('INSERT INTO clients (name, image_url, description, website) VALUES (?, ?, ?, ?)', [name, image_url, description, website]);
    res.json({ id: info.insertId });
  });

  app.put('/api/clients/:id', requireAdmin, async (req, res) => {
    const { name, image_url, description, website } = req.body;
    await pool.query('UPDATE clients SET name = ?, image_url = ?, description = ?, website = ? WHERE id = ?', [name, image_url, description, website, req.params.id]);
    res.json({ success: true });
  });

  app.delete('/api/clients/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Inquiries API
  app.get('/api/inquiries', requireAdmin, async (req, res) => {
    const [inquiries] = await pool.query<any>('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(inquiries);
  });

  app.post('/api/inquiries', async (req, res) => {
    let { name, email, phone, message } = req.body;
    
    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      return res.status(400).json({ error: 'Valid name is required' });
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 255) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (phone && (typeof phone !== 'string' || phone.length > 50 || !/^[0-9+\-\s()]*$/.test(phone))) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
      return res.status(400).json({ error: 'Message is required and must not exceed 5000 characters' });
    }
    
    name = name.trim();
    email = email.trim();
    phone = phone ? phone.trim() : null;
    message = message.trim();

    const [info] = await pool.query<any>('INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)', [name, email, phone, message]);
    res.json({ success: true, id: info.insertId });
  });

  // Error handling middleware for API routes
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global Error Handler:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message, stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

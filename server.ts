import express from 'express';
import 'express-async-errors';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import path from 'path';
import pool, { initializeDb } from './server/db.js';

const ADMIN_PASSWORD = 'admin'; // Hardcoded for demo purposes

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

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
    const { username = 'admin', password, token } = req.body;
    
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
      const bcrypt = await import('bcryptjs');
      let validPassword = false;
      
      // If the stored hash looks like a bcrypt hash
      if (adminUser.password_hash.startsWith('$2a$') || adminUser.password_hash.startsWith('$2b$')) {
        validPassword = await bcrypt.default.compare(password, adminUser.password_hash);
      } else {
        // Fallback: Check if it's plain text (user manually updated DB)
        validPassword = (password === adminUser.password_hash);
        
        // Auto-upgrade to bcrypt hash if valid
        if (validPassword) {
          const newHash = await bcrypt.default.hash(password, 10);
          await pool.query('UPDATE admins SET password_hash = ? WHERE username = ?', [newHash, username]);
          console.log('Upgraded plain-text password to bcrypt hash');
        }
      }
      
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
        }

        res.cookie('admin_auth', 'true', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
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
    res.clearCookie('admin_auth', { httpOnly: true, sameSite: 'none', secure: true });
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

  app.get('/api/settings/counters', async (req, res) => {
    const [clients] = await pool.query<any>('SELECT setting_value FROM admin_settings WHERE setting_key = "counter_clients"');
    const [prints] = await pool.query<any>('SELECT setting_value FROM admin_settings WHERE setting_key = "counter_prints"');
    const [experience] = await pool.query<any>('SELECT setting_value FROM admin_settings WHERE setting_key = "counter_experience"');
    const [quality] = await pool.query<any>('SELECT setting_value FROM admin_settings WHERE setting_key = "counter_quality"');

    res.json({
      clients: clients.length > 0 ? clients[0].setting_value : '5,000+',
      prints: prints.length > 0 ? prints[0].setting_value : '1M+',
      experience: experience.length > 0 ? experience[0].setting_value : '15+',
      quality: quality.length > 0 ? quality[0].setting_value : '100%',
    });
  });

  app.post('/api/admin/settings/counters', requireAdmin, async (req, res) => {
    const { clients, prints, experience, quality } = req.body;
    
    if (clients !== undefined) await pool.query('INSERT INTO admin_settings (setting_key, setting_value) VALUES ("counter_clients", ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [String(clients)]);
    if (prints !== undefined) await pool.query('INSERT INTO admin_settings (setting_key, setting_value) VALUES ("counter_prints", ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [String(prints)]);
    if (experience !== undefined) await pool.query('INSERT INTO admin_settings (setting_key, setting_value) VALUES ("counter_experience", ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [String(experience)]);
    if (quality !== undefined) await pool.query('INSERT INTO admin_settings (setting_key, setting_value) VALUES ("counter_quality", ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [String(quality)]);
    
    res.json({ success: true });
  });

  app.get('/api/settings/contact', async (req, res) => {
    const [whatsapp] = await pool.query<any>('SELECT setting_value FROM admin_settings WHERE setting_key = "contact_whatsapp"');
    
    res.json({
      whatsapp: whatsapp.length > 0 ? whatsapp[0].setting_value : '919203700114',
    });
  });

  app.post('/api/admin/settings/contact', requireAdmin, async (req, res) => {
    const { whatsapp } = req.body;
    
    if (whatsapp !== undefined) await pool.query('INSERT INTO admin_settings (setting_key, setting_value) VALUES ("contact_whatsapp", ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [String(whatsapp)]);
    
    res.json({ success: true });
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
    const { reviewer_name, content, rating } = req.body;
    const service_id = req.params.id;
    const [info] = await pool.query<any>('INSERT INTO product_reviews (service_id, reviewer_name, content, rating) VALUES (?, ?, ?, ?)', [service_id, reviewer_name, content, rating || 5]);
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

  // Inquiries API
  app.get('/api/inquiries', requireAdmin, async (req, res) => {
    const [inquiries] = await pool.query<any>('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(inquiries);
  });

  app.post('/api/inquiries', async (req, res) => {
    const { name, email, phone, message } = req.body;
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

import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import db from './server/db.js';

const ADMIN_PASSWORD = 'admin'; // Hardcoded for demo purposes

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  // --- API Routes ---

  app.post('/api/admin/login', (req, res) => {
    const { password, token } = req.body;
    
    if (password === ADMIN_PASSWORD) {
      // Check if 2FA is enabled
      const enabledStmt = db.prepare("SELECT value FROM admin_settings WHERE key = '2fa_enabled'");
      const enabledRow = enabledStmt.get() as { value: string } | undefined;
      const is2faEnabled = enabledRow?.value === 'true';

      if (is2faEnabled) {
        if (!token) {
          return res.status(401).json({ error: '2FA token required', require2fa: true });
        }
        
        const secretStmt = db.prepare("SELECT value FROM admin_settings WHERE key = '2fa_secret'");
        const secretRow = secretStmt.get() as { value: string };
        
        const verified = speakeasy.totp.verify({
          secret: secretRow.value,
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
      res.status(401).json({ error: 'Invalid password' });
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
    const enabledStmt = db.prepare("SELECT value FROM admin_settings WHERE key = '2fa_enabled'");
    const enabledRow = enabledStmt.get() as { value: string } | undefined;
    
    if (enabledRow?.value === 'true') {
      return res.json({ alreadyEnabled: true });
    }

    let secretRow = db.prepare("SELECT value FROM admin_settings WHERE key = '2fa_secret'").get() as { value: string } | undefined;
    let base32Secret = secretRow?.value;
    
    if (!base32Secret) {
      const secret = speakeasy.generateSecret({ name: 'Printing Business Admin' });
      base32Secret = secret.base32;
      db.prepare("INSERT INTO admin_settings (key, value) VALUES ('2fa_secret', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(base32Secret);
    }
    
    const otpauth = speakeasy.otpauthURL({ secret: base32Secret, label: 'Printing Business Admin', encoding: 'base32' });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    
    res.json({ qrCodeUrl, secret: base32Secret });
  });

  app.post('/api/admin/2fa/verify', requireAdmin, (req, res) => {
    const { token } = req.body;
    const secretRow = db.prepare("SELECT value FROM admin_settings WHERE key = '2fa_secret'").get() as { value: string };
    
    const verified = speakeasy.totp.verify({
      secret: secretRow.value,
      encoding: 'base32',
      token: token
    });
    
    if (verified) {
      db.prepare("INSERT INTO admin_settings (key, value) VALUES ('2fa_enabled', 'true') ON CONFLICT(key) DO UPDATE SET value=excluded.value").run();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
    const productsCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
    const inquiriesCount = db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE message LIKE '%Inquiry for%'").get() as { count: number };
    const allInquiriesCount = db.prepare("SELECT COUNT(*) as count FROM inquiries").get() as { count: number };
    res.json({ 
      totalProducts: productsCount.count, 
      bulkInquiries: inquiriesCount.count,
      totalInquiries: allInquiriesCount.count
    });
  });

  app.get('/api/settings/counters', (req, res) => {
    const clients = db.prepare("SELECT value FROM admin_settings WHERE key = 'counter_clients'").get() as { value: string } | undefined;
    const prints = db.prepare("SELECT value FROM admin_settings WHERE key = 'counter_prints'").get() as { value: string } | undefined;
    const experience = db.prepare("SELECT value FROM admin_settings WHERE key = 'counter_experience'").get() as { value: string } | undefined;
    const quality = db.prepare("SELECT value FROM admin_settings WHERE key = 'counter_quality'").get() as { value: string } | undefined;

    res.json({
      clients: clients?.value || '5,000+',
      prints: prints?.value || '1M+',
      experience: experience?.value || '15+',
      quality: quality?.value || '100%',
    });
  });

  app.post('/api/admin/settings/counters', requireAdmin, (req, res) => {
    const { clients, prints, experience, quality } = req.body;
    const stmt = db.prepare("INSERT INTO admin_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
    
    // Using an explicit transaction could be better, or just sequential inserts.
    const runUpdate = db.transaction(() => {
      if (clients !== undefined) stmt.run('counter_clients', String(clients));
      if (prints !== undefined) stmt.run('counter_prints', String(prints));
      if (experience !== undefined) stmt.run('counter_experience', String(experience));
      if (quality !== undefined) stmt.run('counter_quality', String(quality));
    });
    
    runUpdate();
    res.json({ success: true });
  });

  app.get('/api/services/:id/variants', (req, res) => {
    const variants = db.prepare('SELECT * FROM product_variants WHERE service_id = ?').all(req.params.id);
    res.json(variants);
  });

  app.post('/api/services/:id/variants', requireAdmin, (req, res) => {
    const { title, price, image_url } = req.body;
    const service_id = req.params.id;
    const stmt = db.prepare('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)');
    const info = stmt.run(service_id, title, price, image_url || '');
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/services/:id/variants/:variantId', requireAdmin, (req, res) => {
    const stmt = db.prepare('DELETE FROM product_variants WHERE id = ? AND service_id = ?');
    stmt.run(req.params.variantId, req.params.id);
    res.json({ success: true });
  });

  app.put('/api/services/:id/variants/:variantId', requireAdmin, (req, res) => {
    const { title, price, image_url } = req.body;
    const stmt = db.prepare('UPDATE product_variants SET title = ?, price = ?, image_url = ? WHERE id = ? AND service_id = ?');
    stmt.run(title, price, image_url || '', req.params.variantId, req.params.id);
    res.json({ success: true });
  });

  // Services API
  app.get('/api/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services ORDER BY id DESC').all();
    res.json(services);
  });

  app.get('/api/services/:id', (req, res) => {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  });

  app.get('/api/services/:id/reviews', (req, res) => {
    const reviews = db.prepare('SELECT * FROM product_reviews WHERE service_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(reviews);
  });

  app.post('/api/services/:id/reviews', (req, res) => {
    const { reviewer_name, content, rating } = req.body;
    const service_id = req.params.id;
    const stmt = db.prepare('INSERT INTO product_reviews (service_id, reviewer_name, content, rating) VALUES (?, ?, ?, ?)');
    const info = stmt.run(service_id, reviewer_name, content, rating || 5);
    res.json({ id: info.lastInsertRowid });
  });

  app.post('/api/services', requireAdmin, (req, res) => {
    const { title, description, image_url, category, price } = req.body;
    const stmt = db.prepare('INSERT INTO services (title, description, image_url, category, price) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, description, image_url, category, price || '');
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/services/:id', requireAdmin, (req, res) => {
    const stmt = db.prepare('DELETE FROM services WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  // Testimonials API
  app.get('/api/testimonials', (req, res) => {
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY id DESC').all();
    res.json(testimonials);
  });

  app.post('/api/testimonials', requireAdmin, (req, res) => {
    const { client_name, content, rating } = req.body;
    const stmt = db.prepare('INSERT INTO testimonials (client_name, content, rating) VALUES (?, ?, ?)');
    const info = stmt.run(client_name, content, rating);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/testimonials/:id', requireAdmin, (req, res) => {
    const stmt = db.prepare('DELETE FROM testimonials WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  // Inquiries API
  app.get('/api/inquiries', requireAdmin, (req, res) => {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
    res.json(inquiries);
  });

  app.post('/api/inquiries', (req, res) => {
    const { name, email, phone, message } = req.body;
    const stmt = db.prepare('INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, phone, message);
    res.json({ success: true, id: info.lastInsertRowid });
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
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

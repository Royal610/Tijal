import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import db from './server/db.js';

const ADMIN_PASSWORD = 'admin'; // Hardcoded for demo purposes

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.cookie('admin_auth', 'true', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('admin_auth');
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

  app.get('/api/services/:id/variants', (req, res) => {
    const variants = db.prepare('SELECT * FROM product_variants WHERE service_id = ?').all(req.params.id);
    res.json(variants);
  });

  app.post('/api/services/:id/variants', requireAdmin, (req, res) => {
    const { title, price } = req.body;
    const service_id = req.params.id;
    const stmt = db.prepare('INSERT INTO product_variants (service_id, title, price) VALUES (?, ?, ?)');
    const info = stmt.run(service_id, title, price);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/services/:id/variants/:variantId', requireAdmin, (req, res) => {
    const stmt = db.prepare('DELETE FROM product_variants WHERE id = ? AND service_id = ?');
    stmt.run(req.params.variantId, req.params.id);
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

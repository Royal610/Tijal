import Database from 'better-sqlite3';

const db = new Database('printing_business.db');

db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    price TEXT
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    reviewer_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services (id)
  );
  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services (id)
  );
`);

try {
  db.exec('ALTER TABLE services ADD COLUMN price TEXT;');
} catch (e) {
  // column might already exist
}

// Seed initial data if empty
const stmt = db.prepare('SELECT COUNT(*) AS count FROM services');
const { count } = stmt.get() as { count: number };

if (count === 0) {
  const insertService = db.prepare('INSERT INTO services (title, description, image_url, category, price) VALUES (?, ?, ?, ?, ?)');
  
  const idcardInfo = insertService.run(
    'ID Cards', 'High-quality PVC ID cards for corporate, schools, and events.', 'https://picsum.photos/seed/id/800/600', 'Cards', '₹50 / unit'
  );

  insertService.run('Keyrings', 'Custom printed and engraved keyrings in various materials.', 'https://picsum.photos/seed/key/800/600', 'Accessories', '₹30 / unit');
  insertService.run('Visiting Cards', 'Premium business cards with matte, gloss, or textured finishes.', 'https://picsum.photos/seed/visiting/800/600', 'Cards', '₹500 / 1000 pcs');
  insertService.run('Digital Printing', 'Fast and vibrant digital printing for brochures, flyers, and more.', 'https://picsum.photos/seed/digital/800/600', 'Printing', '₹10 / page');
  insertService.run('Banners & Flex', 'Large format printing for outdoor and indoor advertising.', 'https://picsum.photos/seed/banner/800/600', 'Large Format', '₹200 / sqft');
  insertService.run('Mug Printing', 'Personalized ceramic mugs for gifts and corporate branding.', 'https://picsum.photos/seed/mug/800/600', 'Gifts', '₹150 / unit');

  const insertVariant = db.prepare('INSERT INTO product_variants (service_id, title, price) VALUES (?, ?, ?)');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Standard PVC ID Card', '₹40 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Premium Matte ID Card', '₹60 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Proximity/RFID ID Card', '₹150 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Smart Chip ID Card', '₹200 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Eco-friendly Wooden ID Card', '₹350 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Transparent PVC ID Card', '₹80 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Metal Engraved ID Card', '₹500 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Custom Shape ID Card', '₹100 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Employee ID with Digital Signature', '₹70 / unit');
  insertVariant.run(idcardInfo.lastInsertRowid, 'Event Badge (Oversized)', '₹30 / unit');
  
  const insertTestimonial = db.prepare('INSERT INTO testimonials (client_name, content, rating) VALUES (?, ?, ?)');
  const initialTestimonials = [
    ['Sarah Jenkins', 'The quality of the visiting cards was exceptional. Fast delivery and great customer service!', 5],
    ['Michael Chen', 'We ordered 500 ID cards for our staff. They look incredibly professional.', 5],
    ['Amanda Roberts', 'The flex banners for our event were vibrant and durable. Highly recommend their services.', 4]
  ];

  initialTestimonials.forEach(testimonial => {
    insertTestimonial.run(testimonial);
  });
}

// Seed product variants if empty
const varStmt = db.prepare('SELECT COUNT(*) AS count FROM product_variants');
const varCount = (varStmt.get() as { count: number }).count;

if (varCount === 0) {
  const idcardStmt = db.prepare("SELECT id FROM services WHERE title LIKE '%ID Card%'");
  const idcard = idcardStmt.get() as { id: number } | undefined;
  
  if (idcard) {
    const insertVariant = db.prepare('INSERT INTO product_variants (service_id, title, price) VALUES (?, ?, ?)');
    insertVariant.run(idcard.id, 'Standard PVC ID Card', '₹40 / unit');
    insertVariant.run(idcard.id, 'Premium Matte ID Card', '₹60 / unit');
    insertVariant.run(idcard.id, 'Proximity/RFID ID Card', '₹150 / unit');
    insertVariant.run(idcard.id, 'Smart Chip ID Card', '₹200 / unit');
    insertVariant.run(idcard.id, 'Eco-friendly Wooden ID Card', '₹350 / unit');
    insertVariant.run(idcard.id, 'Transparent PVC ID Card', '₹80 / unit');
    insertVariant.run(idcard.id, 'Metal Engraved ID Card', '₹500 / unit');
    insertVariant.run(idcard.id, 'Custom Shape ID Card', '₹100 / unit');
    insertVariant.run(idcard.id, 'Employee ID with Digital Signature', '₹70 / unit');
    insertVariant.run(idcard.id, 'Event Badge (Oversized)', '₹30 / unit');
  }
}

export default db;

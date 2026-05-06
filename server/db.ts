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

// Seed product variants for any product without variants
const allServicesStmt = db.prepare('SELECT id, title FROM services');
const allServices = allServicesStmt.all() as { id: number, title: string }[];

const countVariantsStmt = db.prepare('SELECT COUNT(*) as c FROM product_variants WHERE service_id = ?');
const insertVariant = db.prepare('INSERT INTO product_variants (service_id, title, price) VALUES (?, ?, ?)');

for (const serv of allServices) {
  const { c } = countVariantsStmt.get(serv.id) as { c: number };
  if (c === 0) {
    if (serv.title.includes('ID Card')) {
      insertVariant.run(serv.id, 'Standard PVC ID Card', '₹40 / unit');
      insertVariant.run(serv.id, 'Premium Matte ID Card', '₹60 / unit');
      insertVariant.run(serv.id, 'Proximity/RFID ID Card', '₹150 / unit');
      insertVariant.run(serv.id, 'Smart Chip ID Card', '₹200 / unit');
      insertVariant.run(serv.id, 'Eco-friendly Wooden ID Card', '₹350 / unit');
      insertVariant.run(serv.id, 'Transparent PVC ID Card', '₹80 / unit');
      insertVariant.run(serv.id, 'Metal Engraved ID Card', '₹500 / unit');
      insertVariant.run(serv.id, 'Custom Shape ID Card', '₹100 / unit');
      insertVariant.run(serv.id, 'Employee ID with Digital Signature', '₹70 / unit');
      insertVariant.run(serv.id, 'Event Badge (Oversized)', '₹30 / unit');
    } else if (serv.title.includes('Keyring')) {
      insertVariant.run(serv.id, 'Acrylic Keyring', '₹30 / unit');
      insertVariant.run(serv.id, 'Metal Engraved Keyring', '₹80 / unit');
      insertVariant.run(serv.id, 'Soft Rubber Keyring', '₹40 / unit');
      insertVariant.run(serv.id, 'Leather Keyring (Standard)', '₹150 / unit');
      insertVariant.run(serv.id, 'Leather Keyring (Premium)', '₹250 / unit');
      insertVariant.run(serv.id, 'Wooden Carved Keyring', '₹60 / unit');
      insertVariant.run(serv.id, 'Custom Shape Plastic Keyring', '₹50 / unit');
      insertVariant.run(serv.id, 'Photo Printed Keyring', '₹70 / unit');
      insertVariant.run(serv.id, 'Bottle Opener Keyring', '₹100 / unit');
      insertVariant.run(serv.id, 'Multi-tool Metal Keyring', '₹200 / unit');
    } else if (serv.title.includes('Visiting Card')) {
      insertVariant.run(serv.id, 'Standard Glossy Card', '₹300 / 1000 pcs');
      insertVariant.run(serv.id, 'Standard Matte Card', '₹400 / 1000 pcs');
      insertVariant.run(serv.id, 'Premium Velvet Lamination', '₹800 / 1000 pcs');
      insertVariant.run(serv.id, 'Spot UV Embossed Card', '₹1200 / 1000 pcs');
      insertVariant.run(serv.id, 'Textured Paper Card', '₹1500 / 1000 pcs');
      insertVariant.run(serv.id, 'Foil Stamped Card', '₹2000 / 1000 pcs');
      insertVariant.run(serv.id, 'Transparent Plastic Card', '₹2500 / 1000 pcs');
      insertVariant.run(serv.id, 'Die-Cut Custom Shape Card', '₹1800 / 1000 pcs');
      insertVariant.run(serv.id, 'Tear-resistant Synthetic Card', '₹1000 / 1000 pcs');
      insertVariant.run(serv.id, 'Eco-friendly Kraft Paper Card', '₹600 / 1000 pcs');
    } else if (serv.title.includes('Digital Printing')) {
      insertVariant.run(serv.id, 'A4 Black & White (Text)', '₹2 / page');
      insertVariant.run(serv.id, 'A4 Color (Document)', '₹10 / page');
      insertVariant.run(serv.id, 'A4 High-Res Photo Print', '₹30 / page');
      insertVariant.run(serv.id, 'A3 Black & White', '₹5 / page');
      insertVariant.run(serv.id, 'A3 Color Print', '₹20 / page');
      insertVariant.run(serv.id, 'A3 High-Res Poster', '₹60 / page');
      insertVariant.run(serv.id, 'Custom Size Flyer (A5)', '₹8 / page');
      insertVariant.run(serv.id, 'Glossy Trifold Brochure', '₹25 / unit');
      insertVariant.run(serv.id, 'Matte Booklet Printing', '₹15 / page');
      insertVariant.run(serv.id, 'Sticker/Label Sheet (A4)', '₹40 / sheet');
    } else if (serv.title.includes('Banners')) {
      insertVariant.run(serv.id, 'Standard Flex Banner', '₹15 / sqft');
      insertVariant.run(serv.id, 'Star Flex Banner (Premium)', '₹25 / sqft');
      insertVariant.run(serv.id, 'Backlit Flex for Glow Sign', '₹40 / sqft');
      insertVariant.run(serv.id, 'Vinyl Sticker Print', '₹60 / sqft');
      insertVariant.run(serv.id, 'Clear Vinyl Print', '₹80 / sqft');
      insertVariant.run(serv.id, 'One-Way Vision Film', '₹70 / sqft');
      insertVariant.run(serv.id, 'Fabric Banner Printing', '₹100 / sqft');
      insertVariant.run(serv.id, 'Standee / Roll-up Banner', '₹1500 / unit');
      insertVariant.run(serv.id, 'Sunboard Mounting', '₹120 / sqft');
      insertVariant.run(serv.id, 'Canvas Banner Print', '₹200 / sqft');
    } else if (serv.title.includes('Mug')) {
      insertVariant.run(serv.id, 'Standard White Mug', '₹150 / unit');
      insertVariant.run(serv.id, 'Inner Color White Mug', '₹180 / unit');
      insertVariant.run(serv.id, 'Magic Color-Changing Mug', '₹250 / unit');
      insertVariant.run(serv.id, 'Patch Mug', '₹200 / unit');
      insertVariant.run(serv.id, 'Frosted Glass Mug', '₹300 / unit');
      insertVariant.run(serv.id, 'Travel Sipper Mug', '₹350 / unit');
      insertVariant.run(serv.id, 'Neon Color Mug', '₹220 / unit');
      insertVariant.run(serv.id, 'Heart Handle Mug', '₹280 / unit');
      insertVariant.run(serv.id, 'Dual Tone Mug', '₹190 / unit');
      insertVariant.run(serv.id, 'Premium Metallic Mug', '₹400 / unit');
    } else {
      // Default variants for any other product added
      insertVariant.run(serv.id, 'Standard Option', '₹100 / unit');
      insertVariant.run(serv.id, 'Premium Option', '₹200 / unit');
      insertVariant.run(serv.id, 'Deluxe Option', '₹300 / unit');
      insertVariant.run(serv.id, 'Pro Option', '₹500 / unit');
      insertVariant.run(serv.id, 'Elite Option', '₹1000 / unit');
    }
  }
}

export default db;

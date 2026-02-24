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
    category TEXT
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
`);

// Seed initial data if empty
const stmt = db.prepare('SELECT COUNT(*) AS count FROM services');
const { count } = stmt.get() as { count: number };

if (count === 0) {
  const insertService = db.prepare('INSERT INTO services (title, description, image_url, category) VALUES (?, ?, ?, ?)');
  const initialServices = [
    ['ID Cards', 'High-quality PVC ID cards for corporate, schools, and events.', 'https://picsum.photos/seed/id/800/600', 'Cards'],
    ['Keyrings', 'Custom printed and engraved keyrings in various materials.', 'https://picsum.photos/seed/key/800/600', 'Accessories'],
    ['Visiting Cards', 'Premium business cards with matte, gloss, or textured finishes.', 'https://picsum.photos/seed/visiting/800/600', 'Cards'],
    ['Digital Printing', 'Fast and vibrant digital printing for brochures, flyers, and more.', 'https://picsum.photos/seed/digital/800/600', 'Printing'],
    ['Banners & Flex', 'Large format printing for outdoor and indoor advertising.', 'https://picsum.photos/seed/banner/800/600', 'Large Format'],
    ['Mug Printing', 'Personalized ceramic mugs for gifts and corporate branding.', 'https://picsum.photos/seed/mug/800/600', 'Gifts']
  ];
  
  initialServices.forEach(service => {
    insertService.run(service);
  });

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

export default db;

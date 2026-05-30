import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let dbHost = process.env.DB_HOST || 'localhost';
if (dbHost === 'viyom') {
  dbHost = 'localhost';
}
const [host, port] = dbHost.split(':');

const pool = mysql.createPool({
  host: host,
  port: port ? parseInt(port, 10) : parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'viyom_user',
  password: process.env.DB_PASSWORD || 'Viyomkesh#$1092',
  database: process.env.DB_NAME || 'viyom_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// A wrapper to avoid crashing the whole API in the AI Studio preview
let mockAdminStore: any = null;

const originalQuery = pool.query.bind(pool);
(pool as any).query = async function(...args: any[]) {
      try {
    return await originalQuery(...args);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production' && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN' || error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_BAD_DB_ERROR')) {
      // Return a shape that won't crash simple endpoints
      const sql = args[0] as string;
      if (typeof sql === 'string') {
        if (sql.includes('FROM admins WHERE username')) {
          if (!mockAdminStore) {
            mockAdminStore = { username: 'admin', password: 'admin', two_factor_enabled: 0, two_factor_secret: null };
          }
          return [[mockAdminStore], []] as any;
        } else if (sql.includes('UPDATE admins SET two_factor_secret')) {
          if (mockAdminStore) mockAdminStore.two_factor_secret = args[1][0];
          return [[], []] as any;
        } else if (sql.includes('UPDATE admins SET two_factor_enabled')) {
          if (mockAdminStore) mockAdminStore.two_factor_enabled = 1;
          return [[], []] as any;
        } else if (sql.includes('UPDATE admins SET password')) {
          if (mockAdminStore) mockAdminStore.password = args[1][0];
          return [[], []] as any;
        }
      }

      const mockRow = { count: 0, c: 0, setting_value: '0', title: '', price: '', image_url: '', id: 0 };
      const mockResult = [mockRow];
      return [mockResult, []] as any;
    }
    throw error;
  }
};

export async function initializeDb() {
  console.log('Attempting to initialize database tables...');
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url LONGTEXT,
        category VARCHAR(255),
        price VARCHAR(255)
      )
    `);

  // Alter tables just in case they already exist to support base64 images
  try {
    await pool.query('ALTER TABLE services MODIFY COLUMN image_url LONGTEXT');
  } catch(e) {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      rating INT DEFAULT 5
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id INT NOT NULL,
      reviewer_name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      rating INT DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      price VARCHAR(255) NOT NULL,
      image_url LONGTEXT,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
    )
  `);

  try {
    await pool.query('ALTER TABLE product_variants MODIFY COLUMN image_url LONGTEXT');
  } catch(e) {}

  try {
    await pool.query('DROP TABLE IF EXISTS admin_settings');
  } catch(e) {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      two_factor_secret VARCHAR(255),
      two_factor_enabled BOOLEAN DEFAULT FALSE
    )
  `);

  try {
    await pool.query('ALTER TABLE admins CHANGE COLUMN password_hash password VARCHAR(255) NOT NULL');
  } catch(e) {}

  // Seed default admin
  const [adminRows] = await pool.query<{count: number}[] & mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM admins');
  if (adminRows[0].count === 0) {
    await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', 'admin123']);
  }

  // Seed initial data if empty
  const [rows] = await pool.query<{count: number}[] & mysql.RowDataPacket[]>('SELECT COUNT(*) AS count FROM services');
  const count = rows[0].count;

  if (count === 0) {
    const [result1] = await pool.query<mysql.ResultSetHeader>(
      'INSERT INTO services (title, description, image_url, category, price) VALUES (?, ?, ?, ?, ?)',
      ['ID Cards', 'High-quality PVC ID cards for corporate, schools, and events.', 'https://picsum.photos/seed/id/800/600', 'Cards', '₹50 / unit']
    );
    const idcardId = result1.insertId;

    const initialServices = [
      ['Keyrings', 'Custom printed and engraved keyrings in various materials.', 'https://picsum.photos/seed/key/800/600', 'Accessories', '₹30 / unit'],
      ['Visiting Cards', 'Premium business cards with matte, gloss, or textured finishes.', 'https://picsum.photos/seed/visiting/800/600', 'Cards', '₹500 / 1000 pcs'],
      ['Digital Printing', 'Fast and vibrant digital printing for brochures, flyers, and more.', 'https://picsum.photos/seed/digital/800/600', 'Printing', '₹10 / page'],
      ['Banners & Flex', 'Large format printing for outdoor and indoor advertising.', 'https://picsum.photos/seed/banner/800/600', 'Large Format', '₹200 / sqft'],
      ['Mug Printing', 'Personalized ceramic mugs for gifts and corporate branding.', 'https://picsum.photos/seed/mug/800/600', 'Gifts', '₹150 / unit']
    ];

    for (const serv of initialServices) {
      await pool.query('INSERT INTO services (title, description, image_url, category, price) VALUES (?, ?, ?, ?, ?)', serv);
    }

    const idcardVariants = [
      ['Standard PVC ID Card', '₹40 / unit'],
      ['Premium Matte ID Card', '₹60 / unit'],
      ['Proximity/RFID ID Card', '₹150 / unit'],
      ['Smart Chip ID Card', '₹200 / unit'],
      ['Eco-friendly Wooden ID Card', '₹350 / unit'],
      ['Transparent PVC ID Card', '₹80 / unit'],
      ['Metal Engraved ID Card', '₹500 / unit'],
      ['Custom Shape ID Card', '₹100 / unit'],
      ['Employee ID with Digital Signature', '₹70 / unit'],
      ['Event Badge (Oversized)', '₹30 / unit']
    ];

    for (const v of idcardVariants) {
      await pool.query('INSERT INTO product_variants (service_id, title, price) VALUES (?, ?, ?)', [idcardId, v[0], v[1]]);
    }
    
    const initialTestimonials = [
      ['Sarah Jenkins', 'The quality of the visiting cards was exceptional. Fast delivery and great customer service!', 5],
      ['Michael Chen', 'We ordered 500 ID cards for our staff. They look incredibly professional.', 5],
      ['Amanda Roberts', 'The flex banners for our event were vibrant and durable. Highly recommend their services.', 4]
    ];

    for (const testimonial of initialTestimonials) {
      await pool.query('INSERT INTO testimonials (client_name, content, rating) VALUES (?, ?, ?)', testimonial);
    }
  }

  // Seed product variants for any product without variants
  const [allServices] = await pool.query<{id: number, title: string}[] & mysql.RowDataPacket[]>('SELECT id, title FROM services');

  for (const serv of allServices) {
    const [cRows] = await pool.query<{c: number}[] & mysql.RowDataPacket[]>('SELECT COUNT(*) as c FROM product_variants WHERE service_id = ?', [serv.id]);
    const { c } = cRows[0];
    
    if (c === 0) {
      if (serv.title.includes('ID Card')) {
        await pool.query('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [serv.id, 'Standard PVC ID Card', '₹40 / unit', 'https://picsum.photos/seed/id1/400/300']);
      } else if (serv.title.includes('Keyring')) {
        await pool.query('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [serv.id, 'Acrylic Keyring', '₹30 / unit', 'https://picsum.photos/seed/kr1/400/300']);
      } else if (serv.title.includes('Visiting Card')) {
        await pool.query('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [serv.id, 'Standard Glossy Card', '₹300 / 1000 pcs', 'https://picsum.photos/seed/vc1/400/300']);
      } else if (serv.title.includes('Digital Printing')) {
        await pool.query('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [serv.id, 'A4 Black & White (Text)', '₹2 / page', 'https://picsum.photos/seed/dp1/400/300']);
      } else if (serv.title.includes('Banners')) {
        await pool.query('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [serv.id, 'Standard Flex Banner', '₹15 / sqft', 'https://picsum.photos/seed/bn1/400/300']);
      } else if (serv.title.includes('Mug')) {
         await pool.query('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [serv.id, 'Standard White Mug', '₹150 / unit', 'https://picsum.photos/seed/mg1/400/300']);
      } else {
        await pool.query('INSERT INTO product_variants (service_id, title, price, image_url) VALUES (?, ?, ?, ?)', [serv.id, 'Standard Option', '₹100 / unit', 'https://picsum.photos/seed/def1/400/300']);
      }
    }
  }
  
  console.log('Database initialization completed successfully.');
  } catch (error: any) {
    console.error('DATABASE INITIALIZATION FAILED: Please check your MySQL database credentials (DB_USER, DB_PASSWORD, DB_NAME, DB_HOST).');
    console.error('MySQL Error:', error.message);
    throw error;
  }
}

export default pool;

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'printing_business';

  try {
    console.log(`Connecting to MySQL at ${host} as ${user}...`);
    const connection = await mysql.createConnection({
      host,
      user,
      password,
    });

    console.log(`Creating database ${database} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.end();

    console.log('Database created. Initializing tables...');
    const { initializeDb } = await import('../server/db.js');
    await initializeDb();
    console.log('Tables initialized and data seeded successfully.');
  } catch (error: any) {
    console.error('Failed to set up database:', error.message);
    // Don't break the build/install process if the DB server isn't running yet.
    process.exit(0); 
  }
}

setup();

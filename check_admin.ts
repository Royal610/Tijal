import pool from './server/db.js';
async function test() {
  try {
    const [rows] = await pool.query('SELECT * FROM admins');
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();

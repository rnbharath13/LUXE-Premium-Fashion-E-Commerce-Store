import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
    enableKeepAlive: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

export async function getConnection() {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✓ Connected to SQL Server');
  }
  return pool;
}

export async function query(queryString) {
  const conn = await getConnection();
  return await conn.request().query(queryString);
}

export async function closeConnection() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('✓ Disconnected from SQL Server');
  }
}

export default getConnection;

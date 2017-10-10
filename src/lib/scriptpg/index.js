const pg = require('pg');
const SQL = require('sql-template-strings');

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movieisall',
  password: 'ho123456',
  port: 5434,
});

pool.on('error', (err) => {
  console.log('pooling error!');
  throw new Error(err);
});

exports.conn = async () => {
  const client = await pool.connect();
  return client;
};

exports.query = async (sql) => {
  const client = await pool.connect();
  let res;
  try {
    const result = await client.query(sql);
    res = Promise.resolve(result.rows);
  } catch (err) {
    console.log('Error quering!');
    res = Promise.reject(err);
  } finally {
    client.release();
  }
  return res;
};

exports.SQL = SQL;

import pg from 'pg';
import SQL from 'sql-template-strings';

const pool = new pg.Pool({
  user: 'postgres',
  host: 'db',
  database: 'tothemoon',
  password: '111111',
  port: 5432,
});

pool.on('error', (err) => {
  console.log('pooling error!');
  throw new Error(err);
});

const conn = async () => {
  const client = await pool.connect();
  return client;
};

const query = async (sql) => {
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

const pgquery = {
  conn,
  query,
  SQL
};

export default pgquery;

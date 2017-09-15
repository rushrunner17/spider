import queryPg from '../lib/pg';

const addPerson = async (req, res, next) => {
  const name = req.body.name;
  const description = req.body.description;

  if (!name || !description) {
    res.json('name and description are needed!');
    return;
  }

  try {
    await queryPg.query(queryPg.SQL`
      INSERT INTO characters (name, description)
      VALUES (${name}, ${description})
    `);
  } catch (err) {
    res.json({ errmsg: 'query err!' });
    return;
  }

  const respose = {
    name: `${name}`,
    description: `${description}`
  };
  res.json(200, respose);

  next();
};

const listAll = async (req, res, next) => {
  const respose = { characters: [] };

  const data = await queryPg.query(queryPg.SQL`
    SELECT * FROM characters c ORDER BY c.id
  `);

  if (!data || data.length === 0) {
    res.json({ errmsg: '无人物数据！' });
    return;
  }

  for (const item of data) {
    respose.characters.push(item);
  }
  res.json(200, respose);
  next();
};

const del = async (req, res, next) => {
  const uid = req.params.uid;

  await queryPg.query(queryPg.SQL`
    DELETE from characters c where exists
    (SELECT FROM tests t where t.person_id = c.id and t.uid = ${uid})
  `);
  res.json(200, 'ok');
  next();
};

const character = {
  addPerson,
  listAll,
  del
};

export default character;

import queryPg from '../lib/pg';

const addPerson = async (req, res, next) => {
  const name = req.body.name;
  // const description = req.body.description;

  if (!name) {
    res.json('name and description are needed!');
    return;
  }

  try {
    await queryPg.query(queryPg.SQL`
      INSERT INTO persons 
      (name, birthday, birth_place, occupation, movielist_url, image_url, uuid)
      VALUES
      (${name}, 'test', 'test', 'test', 'test', 'test', 'test')
    `);
  } catch (err) {
    res.json({ errmsg: 'query err!' });
    console.log(err);
    return;
  }

  const respose = {
    name: `${name}`
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

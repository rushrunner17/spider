const hello = (req, res, next) => {
  const name = req.params.name;
  res.json(200, `hello ${name}`);
  next();
};

export default hello;

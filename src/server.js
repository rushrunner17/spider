import 'babel-polyfill';
import restify from 'restify';
import routes from './routes';

const server = restify.createServer({
  name: 'spider_restify'
});
server.use(restify.plugins.throttle({
  burst: 100,
  rate: 10,
  ip: true
}));
server.use(restify.plugins.acceptParser(server.acceptable)); // Accept header
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.queryParser({
  mapParams: true,
  plainObjects: false
}));
server.use(restify.plugins.bodyParser({
  mapParams: false,
  multiples: true
}));

routes(server);

server.listen(8081, () => {
  console.log('%s listening at %s', server.name, server.url);
});

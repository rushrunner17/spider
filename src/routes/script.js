import scriptApi from '../spider/script';

export default function scriptRoute(server) {
  server.get('/fetch', scriptApi.fetchPage);
}

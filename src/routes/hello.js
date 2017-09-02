import hello from '../apis/hello';

export default function helloRoute(server) {
  server.get('/hello/:name', hello);
}

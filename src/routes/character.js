import characterApi from '../apis/character';

export default function characterRoute(server) {
  server.post('/character/add', characterApi.addPerson);
  server.get('/character/list', characterApi.listAll);
}

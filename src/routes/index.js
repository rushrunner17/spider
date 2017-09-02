import hello from './hello';
import character from './character';

export default function routes(server) {
  hello(server);
  character(server);
}

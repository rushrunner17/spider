import hello from './hello';
import character from './character';
import script from './script';

export default function routes(server) {
  hello(server);
  character(server);
  script(server);
}

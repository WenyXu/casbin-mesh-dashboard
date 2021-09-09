import { parseConnectString } from '../../services/client/utils/url';
import { deepStrictEqual, equal } from 'assert';

describe('url test', () => {
  test('parse connect string test', () => {
    let t = parseConnectString('mesh://root:root@localhost:4002');
    deepStrictEqual(t, {
      ssl: false,
      auth: { type: 'basic', username: 'root', password: 'root' },
      leader: 'localhost:4002',
      cluster: ['localhost:4002'],
    });
    t = parseConnectString('mesh://localhost:4002');
    deepStrictEqual(t, {
      ssl: false,
      auth: { type: 'noop', username: undefined, password: undefined },
      leader: 'localhost:4002',
      cluster: ['localhost:4002'],
    });
    t = parseConnectString(
      'mesh://root:root@localhost:4002,localhost:4004,localhost:4006'
    );
    deepStrictEqual(t, {
      ssl: false,
      auth: { type: 'basic', username: 'root', password: 'root' },
      leader: 'localhost:4002',
      cluster: ['localhost:4002', 'localhost:4004', 'localhost:4006'],
    });
    t = parseConnectString(
      'mesh://root:root@localhost:4002,localhost:4004,localhost:4006?ssl=true&auth=basic'
    );
    deepStrictEqual(t, {
      ssl: true,
      auth: { type: 'basic', username: 'root', password: 'root' },
      leader: 'localhost:4002',
      cluster: ['localhost:4002', 'localhost:4004', 'localhost:4006'],
    });
  });
});

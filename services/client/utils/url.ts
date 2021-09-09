import { Auth, AuthType, Connection, Result } from '../interface';
import * as queryString from 'querystring';

export const parseURL = (url: string) => {
  if (url.endsWith('/')) {
    url.slice(0, url.length - 1);
  }
  return url;
};

const prefix = 'mesh://';

const defaultConnect: Partial<Connection> = {
  ssl: false,
  auth: { type: 'noop' },
};

const ErrInvalidConnectString = new Error('invalid connect string');

// mesh://root:root@localhost:4002,root:root@localhost:4004?ssl=true&auth=basic
// mesh://root:root@localhost:4002,root:root@localhost:4004
// mesh://localhost:4003
export const parseConnectString = (connect: string): Result<Connection> => {
  if (connect.startsWith(prefix)) {
    connect = connect.slice(prefix.length);
    if (connect === '') {
      return ErrInvalidConnectString;
    }
    const result = connect.split('@');
    let username: string | undefined,
      password: string | undefined,
      authCred: string | undefined,
      urls: string | undefined;
    switch (result.length) {
      case 1:
        urls = result[0];
        if (urls.indexOf(':') > -1) return ErrInvalidConnectString;
        break;
      case 2:
        authCred = result[0];
        urls = result[1];
        if (urls === '') return ErrInvalidConnectString;
        break;
      default:
        return new Error('invalid connect string');
    }
    let [url, query] = urls.split('?');
    const urlList = url.split(',');
    let { ssl, auth } = queryString.parse(query);
    if (Array.isArray(auth)) {
      return new Error('invalid connect auth type');
    }
    if (authCred) {
      auth = 'basic';
    }
    switch (auth) {
      case 'noop':
        break;
      case 'basic':
        if (!authCred) {
          return new Error('get empty username and password');
        }
        let result = authCred.split(':');
        if (result.length !== 2) {
          return new Error('get invalid username and password');
        } else {
          username = result[0];
          password = result[1];
        }
        break;
      case undefined:
        // do nothing
        break;
      default:
        return new Error('invalid connect auth type');
    }
    return {
      ...defaultConnect,
      leader: urlList[0],
      cluster: urlList,
      ssl: ssl === 'true' ?? false,
      auth: {
        type: (auth as AuthType) ?? 'noop',
        username,
        password,
      },
    };
  } else {
    return new Error('invalid connect string');
  }
};

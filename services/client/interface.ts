export type BasicAuth = {
  type: AuthType;
  username: string;
  password: string;
};

export type NoopAuth = {
  type: AuthType;
};

export type Auth = BasicAuth | NoopAuth;
export type AuthType = 'noop' | 'basic';

export type Result<T, E = Error> = T | E;

export const isError = <T>(result: Result<T>): result is Error => {
  return result instanceof Error;
};

export const isSuccess = <T>(result: Result<T>): result is T => {
  return !isError(result);
};

export type Options = {
  fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
} & Connection;

export type Connection = {
  leader: string;
  cluster: string[];
  auth: Auth;
  ssl: boolean;
};

import { AuthType, BasicAuth, NoopAuth } from '../interface';

export const base64 = (data: string) => Buffer.from(data).toString('base64');
export const BasicAuthor = ({
  username,
  password,
}: BasicAuth): Record<string, string> => {
  return {
    Authorization: 'Basic ' + base64(username + ':' + password),
  };
};

export const NoopAuthor = ({}: NoopAuth): Record<string, string> => ({});

export const Author: Record<AuthType, (Auth: any) => Record<string, string>> = {
  noop: NoopAuthor,
  basic: BasicAuthor,
};

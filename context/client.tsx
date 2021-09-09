import { Client } from '../services/client';
import React, { useContext } from 'react';

export const defaultClient = new Client();
export const DefaultClient = React.createContext<Client>(defaultClient);

let hasWarnedAboutDefault = false;

export const useClient = (): Client => {
  const client = useContext(DefaultClient);

  if (
    process.env.NODE_ENV !== 'production' &&
    client === defaultClient &&
    !hasWarnedAboutDefault
  ) {
    hasWarnedAboutDefault = true;

    console.warn(
      'Default Client: No client has been specified using Provider.'
    );
  }

  return client;
};

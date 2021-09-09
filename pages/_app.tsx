import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { initializeIcons, ThemeProvider } from '@fluentui/react';
import { defaultClient, DefaultClient } from '../context/client';
import { Theme } from '../theme';
initializeIcons();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider applyTo="body" theme={Theme}>
      <DefaultClient.Provider value={defaultClient}>
        <Component {...pageProps} />
      </DefaultClient.Provider>
    </ThemeProvider>
  );
}
export default MyApp;

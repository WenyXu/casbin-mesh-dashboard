import * as React from 'react';
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { Stylesheet, InjectionMode, resetIds } from '@fluentui/react';
const stylesheet = Stylesheet.getInstance();
import { ServerStyleSheet } from 'styled-components';

stylesheet.setConfig({
  injectionMode: InjectionMode.none,
  namespace: 'server',
});

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const { renderPage } = ctx;
    stylesheet.reset();
    resetIds();

    const page = renderPage(
      (App) => (props) => sheet.collectStyles(<App {...props} />)
    );
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...page,
      styles: (
        <>
          {initialProps.styles}
          {sheet.getStyleElement()}
        </>
      ),
      styleTags: stylesheet.getRules(true),
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            type="text/css"
            // @ts-ignore
            dangerouslySetInnerHTML={{ __html: this.props.styleTags }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

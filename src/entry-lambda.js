import clientManifest from 'client-manifest';
import serverBundle from 'server-bundle';
import { createBundleRenderer } from 'vue-server-renderer';

const template = `
<html>
<head>
  <title>{{title}}</title>
  {{{meta}}}
</head>
<body>
  <!--vue-ssr-outlet-->
</body>
</html>`;

const renderer = createBundleRenderer(serverBundle, {
  template,
  clientManifest,
  runInNewContext: false
});

export async function handler() {
  const appContext = {
    title: 'SSR Example', // default title
    url: '/',
    meta: '<meta name="viewport" content="width=device-width, initial-scale=1">'
  };

  if (typeof window === 'undefined') {
    // eslint-disable-next-line
    console.debug('> Asserting in lambda');
    // Here we include a node builtin module.
    // https://nodejs.org/docs/latest-v8.x/api/assert.html#assert_assert_ok_value_message
    const assert = require('assert');
    assert.ok(true); // Will never fail
  }
  const html = await renderer.renderToString(appContext);

  return {
    headers: {
      'Content-Type': 'text/html'
    },
    isBase64Encoded: false,
    body: html
  };
}

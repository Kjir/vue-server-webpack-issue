const path = require('path');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const TARGET_NODE = process.env.WEBPACK_TARGET === 'node';
const TARGET_LAMBDA = process.env.WEBPACK_TARGET === 'lambda';
const TARGET_SERVER = TARGET_NODE || TARGET_LAMBDA;

const target = TARGET_SERVER ? (TARGET_LAMBDA ? 'lambda' : 'server') : 'client';

module.exports = {
  chainWebpack: config => {
    config
      .entry('app')
      .clear()
      .add(`./src/entry-${target}`);

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        optimizeSSR: false
      }));

    if (TARGET_SERVER) {
      config.optimization.splitChunks(false);
      config.target('node');
      config.output.libraryTarget('commonjs2');
      if (TARGET_NODE) {
        // This is where we create the server JSON for the prerendering
        config.plugin('ssr').use(VueSSRServerPlugin);
      } else {
        // Here we are building the AWS lambda entrypoint
        config.output.filename('lambda.js');
        config.resolve.alias.set(
          'client-manifest',
          path.resolve(__dirname, 'dist/client/vue-ssr-client-manifest.json')
        );
        config.resolve.alias.set('server-bundle', path.resolve(__dirname, 'dist/server/vue-ssr-server-bundle.json'));
        config.plugins.delete('copy');
        config.plugins.delete('preload');
        config.plugins.delete('prefetch');
        config.plugins.delete('html');
      }
    } else {
      // Here we are building the client version of the app
      config.target('web');
      config.plugin('ssr').use(VueSSRClientPlugin);
    }
  },
  outputDir: `dist/${target}`
};

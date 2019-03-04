# server-webpack-issue

This project is a simple reproduction of a bug occurring when trying to bundle
the server portion of the SSR setup.

To reproduce the issue, simply run `yarn test`.

## Explanation

### Vue SSR Guide

The [Vue SSR Guide](https://ssr.vuejs.org) is the basis for this setup. In the
guide, there is one file (`scripts/server.js` in the guide) that is used to
configure the express server. That file is used as-is by the server without
being preprocessed by webpack.

### Bundle all the things!!

This project includes a setup that will preprocess the server bootstrapping code
as well.

Why use webpack on the server? The assumption in the Vue SSR Guide is that a
server doesn't need to bundle the code because download times are not an issue
and node itself supports modules natively, removing two of the biggest
advantages of webpack.

While this is true in the context of a traditional express application served by
an always-on server, it is not so true in the context of serverless: there are
many reasons for eliminating dead code from the bundle.

Reasons include:

- Smaller code will run faster
- Reduced redeployment time
- Use typescript/babel in bootstrap as well
  => Avoid a special snowflake in your code base
- Leverage webpack's loaders

### Build configuration

To bundle the bootstrap code, a third build step has to be introduced:

1. The first step is to build the client-side version of the app with `VueSSRClientPlugin`
2. Then the server bundle is generated in JSON format by `VueSSRServerPlugin`
3. Lastly the bootstrap code for AWS Lambda is bundled

In the `vue.config.js` these three steps are identified by the variables
`TARGET_NODE` (step 2) and `TARGET_LAMBDA` (step 3) and the `else` branch (step 1)

### The code loading process

When the code is executed by the AWS Lambda, it will run the handle that is
defined in `src/entry-lambda.js`. This code includes the JSON resulting from the
`VueSSRServerPlugin` and the manifest for the client build.

The bootstrap will start the rendering of the Vue app, which will execute the
server portion of the code. This will generate some HTML that will have links to
the client-side version of the app. This is then returned to the user and the
client-side application takes over from there.

### The issue (at last!)

This setup worked fine until we included `axios` to retrieve data from our API.
The failure would be a very confusing `Error: Cannot find module 'http'`, which
is a builtin node module used by `axios` in a node context (instead
of `XMLHttpRequest`).

To reduce the issue in its simplest form, in this project we make use of the
`assert` builtin module. This module is included in two different points to
demonstrate in which context it will fail and in which it won't:

- `src/entry-lambda.js` is the bootstrap code and will work as intended.
- `src/App.vue` is the main application code and it is run as part of the server bundle. Here the `require` will fail.

The `require` was wrapped in a check to ensure it is only performed on node,
just to underline that the runtime is correct.

## Project setup

This project expects a node version 8.10 since this is the latest version
supported by AWS Lambda

```
yarn install
```

### Compiles and minifies for production

```
yarn run build
```

### Executes the test to verify the bug

```
yarn run test
```

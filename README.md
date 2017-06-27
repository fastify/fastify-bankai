# fastify-pigeon
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)  [![Build Status](https://travis-ci.org/fastify/fastify-pigeon.svg?branch=master)](https://travis-ci.org/fastify/fastify-pigeon) [![Greenkeeper badge](https://badges.greenkeeper.io/fastify/fastify-pigeon.svg)](https://greenkeeper.io/)

If you need to compile (browserify style!) your code, this plugin is for you! 
Internally it uses [bankai](https://github.com/yoshuawuyts/bankai), so refer to its documentation for the options.

**fastify-pigeon** will automatically live-reload your HTML and
regenerate your bundle whenever your code change. This can be disabled
in test or in production.

## Install
```
npm i fastify-pigeon --save
```

## Usage
Simply require this plugin, pass the entry file and you are done!
```js
const fastify = require('fastify')()

fastify.register(require('fastify-pigeon'), {
  entryFile: './client.js'
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log('Server listenting on localhost:', fastify.server.address().port)
})
```

### In tests or in production

If you are including fastify-pigeon in any test run or in production, you **must** disable
the automatic watch mode:

```js
const fastify = require('fastify')()

fastify.register(require('fastify-pigeon'), {
  entryFile: './client.js',
  options: {
    watch: false
  }
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log('Server listenting on localhost:', fastify.server.address().port)
})
```

## Options
- `entryFile`: Your application entry point
- `baseURL`: a custom url, default `'/'`
- `options`: the options object for bankai

## Acknowledgements

This project is kindly sponsored by:
- [nearForm](http://nearform.com)
- [LetzDoIt](http://www.letzdoitapp.com/)

## License

Licensed under [MIT](./LICENSE).

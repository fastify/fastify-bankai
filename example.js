'use strict'

const fastify = require('fastify')()

fastify.register(require('./index'), {
  entryFile: './client.js',
  html: './index.html'
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log('Server listenting on localhost:', fastify.server.address().port)
})

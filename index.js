'use strict'

const assert = require('assert')
const createReadStream = require('fs').createReadStream
const resolve = require('path').resolve
const fp = require('fastify-plugin')
const bankai = require('bankai')

function assetsCompiler (fastify, opts, next) {
  if (!opts.entry) {
    return next(new Error('Missing entry file!'))
  }
  if (typeof opts.entry !== 'string') {
    return next(new Error('entry must be a string'))
  }
  if (opts.html && typeof opts.html !== 'string') {
    return next(new Error('html must be a string'))
  }

  delete opts.prefix
  const html = !!opts.html
  const htmlPath = resolve(opts.html || '')
  const assets = bankai(resolve(opts.entry || ''), opts)

  fastify.get('/', (req, reply) => {
    reply
      .header('Content-Type', 'text/html')
      .send(html ? createReadStream(htmlPath) : assets.html(req.req, reply.res))
  })

  fastify.get('/:file', (req, reply) => {
    switch (req.params.file.split('.').pop()) {
      case 'html':
        return reply
          .header('content-type', 'text/html')
          .send(assets.html(req.req, reply.res))
      case 'css':
        return reply
          .header('content-type', 'text/css')
          .send(assets.css(req.req, reply.res))
      case 'js':
        return reply
          .header('content-type', 'text/javascript')
          .send(assets.js(req.req, reply.res))
      default:
        return reply
          .code(404)
          .send(new Error('Asset not found'))
    }
  })

  next()
}

// do not use fastify-plugin because this needs to be
// wrapped in its own scope to support prefix
module.exports = assetsCompiler

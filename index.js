'use strict'

const assert = require('assert')
const createReadStream = require('fs').createReadStream
const resolve = require('path').resolve
const fp = require('fastify-plugin')
const bankai = require('bankai')

function assetsCompiler (fastify, opts, next) {
  opts.options = opts.options || {}
  if (!opts.entry) {
    return next(new Error('Missing entry file!'))
  }
  if (typeof opts.entry !== 'string') {
    return next(new Error('entry must be a string'))
  }
  if (opts.html && typeof opts.html !== 'string') {
    return next(new Error('html must be a string'))
  }
  if (typeof opts.options !== 'object') {
    return next(new Error('options must be an object'))
  }

  const html = !!opts.html
  const htmlPath = resolve(opts.html || '')
  const assets = bankai(resolve(opts.entry || ''), opts.options)

  fastify.get(opts.baseURL || '/', (req, reply) => {
    reply
      .header('Content-Type', 'text/html')
      .send(html ? createReadStream(htmlPath) : assets.html(req.req, req.res))
  })

  fastify.get(`${opts.baseURL || ''}/:file`, (req, reply) => {
    switch (req.params.file.split('.').pop()) {
      case 'html':
        return reply
          .header('content-type', 'text/html')
          .send(assets.html(req.req, req.res))
      case 'css':
        return reply
          .header('content-type', 'text/css')
          .send(assets.css(req.req, req.res))
      case 'js':
        return reply
          .header('content-type', 'text/javascript')
          .send(assets.js(req.req, req.res))
      default:
        return reply
          .code(404)
          .send(new Error('Asset not found'))
    }
  })

  next()
}

module.exports = fp(assetsCompiler, '>=0.27.0')

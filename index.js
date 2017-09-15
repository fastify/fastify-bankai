'use strict'

const createReadStream = require('fs').createReadStream
const resolve = require('path').resolve
const bankai = require('bankai')
const fp = require('fastify-plugin')

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

  var prefix = (opts.prefix || '').replace(/^\/?(.*)\/+$/, '/$1')
  delete opts.prefix
  const html = !!opts.html
  const htmlPath = resolve(opts.html || '')
  const assets = bankai(resolve(opts.entry || ''), opts)

  if (prefix && prefix.indexOf('/') !== 0) {
    prefix = '/' + prefix
  }

  fastify.get(`${prefix || '/'}`, (req, reply) => {
    reply
      .header('Content-Type', 'text/html')
      .send(html ? createReadStream(htmlPath) : assets.html(req.req, reply.res))
  })

  fastify.get(`${prefix}/:file`, (req, reply) => {
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

module.exports = fp(assetsCompiler, '>= 0.27.0')

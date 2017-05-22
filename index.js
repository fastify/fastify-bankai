'use strict'

const assert = require('assert')
const createReadStream = require('fs').createReadStream
const join = require('path').join
const fp = require('fastify-plugin')
const bankai = require('bankai')

function assetsCompiler (fastify, opts, next) {
  assert(opts.entryFile, 'Missing entry file!')
  assert.ok(typeof opts.entryFile === 'string', 'entryFile must be a string')
  if (opts.html) assert.ok(typeof opts.html === 'string', 'html must be a string')
  if (opts.baseURL) assert.ok(typeof opts.baseURL === 'string', 'baseURL must be a string')
  if (opts.options) assert.ok(typeof opts.options === 'object', 'options must be an object')

  const html = !!opts.html
  const htmlPath = join(process.cwd(), opts.html || '')
  const assets = bankai(join(process.cwd(), opts.entryFile), opts.options || {})

  fastify.get(opts.baseURL || '/', (req, reply) => {
    reply
      .header('Content-Type', 'text/html')
      .send(html ? createReadStream(htmlPath) : assets.html())
  })

  fastify.get(`${opts.baseURL || ''}/:file`, (req, reply) => {
    switch (req.params.file.split('.').pop()) {
      case 'html':
        return reply
          .header('content-type', 'text/html')
          .send(assets.html())
      case 'css':
        return reply
          .header('content-type', 'text/css')
          .send(assets.css())
      case 'js':
        return reply
          .header('content-type', 'text/javascript')
          .send(assets.js())
      default:
        return reply
          .code(404)
          .send(new Error('Asset not found'))
    }
  })

  next()
}

module.exports = fp(assetsCompiler, '>=0.13.1')

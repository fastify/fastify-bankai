'use strict'

const createReadStream = require('fs').createReadStream
const resolve = require('path').resolve
const bankai = require('bankai')
const fp = require('fastify-plugin')

function fastifyBankai (fastify, opts, next) {
  if (!opts.entry) {
    return next(new Error('missing entry file'))
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

  // be quiet by default
  if (opts.quiet === undefined) {
    opts.quiet = true
  }

  const compiler = bankai(resolve(opts.entry), opts)

  if (prefix && prefix.indexOf('/') !== 0) {
    prefix = '/' + prefix
  }

  const rootRoute = `${prefix || '/'}`

  // TODO is this needed?
  if (html) {
    fastify.get(rootRoute, (req, reply) => {
      reply
        .header('Content-Type', 'text/html')
        .send(createReadStream(htmlPath))
    })
  } else {
    fastify.get(rootRoute, (req, reply) => {
      compiler.documents('/', (err, data) => {
        if (err) {
          reply.send(err)
          return
        }
        reply
          .header('content-type', 'text/html')
          .send(data.buffer)
      })
    })
  }

  fastify.get(`${prefix}/:file`, (req, reply) => {
    const [file, ext] = req.params.file.split('.')
    switch (ext) {
      case 'html':
        compiler.documents(req.req.url, (err, data) => {
          if (err) {
            reply.send(err)
            return
          }
          reply
            .header('content-type', 'text/html')
            .send(data)
        })
        break
      case 'js':
        compiler.scripts(file, (err, data) => {
          if (err) {
            reply.send(err)
            return
          }
          reply
            .header('content-type', 'application/javascript')
            .send(data.buffer)
        })
        break
      case 'css':
        compiler.styles(file, (err, data) => {
          if (err) {
            reply.send(err)
            return
          }
          reply
            .header('content-type', 'text/css')
            .send(data.buffer)
        })
        break
      default:
        compiler.assets(req.req.url, (err, data) => {
          if (err) {
            return reply
              .code(404)
              .send(err)
          }

          // TODO set the correct mime type?
          reply.send(data.buffer)
        })
    }
  })

  fastify.addHook('onClose', (f, done) => {
    compiler.close()
    setImmediate(done)
  })

  compiler.once('change', () => { next() })
}

module.exports = fp(fastifyBankai, {
  name: 'fastify-bankai',
  fastify: '>= 0.40.0'
})

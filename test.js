'use strict'

const t = require('tap')
const test = t.test
const fs = require('fs')
const Fastify = require('fastify')
const html = fs.readFileSync('./index.html', 'utf8')

test('Should expose a route with the assets', t => {
  t.plan(9)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entry: './client.js', watch: false }
  )

  fastify.inject({
    url: '/',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 200)
    t.equal(res.payload, html)
    t.equal(res.headers['content-type'], 'text/html')
  })

  fastify.inject({
    url: '/index.html',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'text/html')
  })

  fastify.inject({
    url: '/bundle.css',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'text/css')
  })

  fastify.inject({
    url: '/bundle.js',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'text/javascript')
  })
})

function testPrefix (prefix) {
  test('should handle a prefix: ' + prefix, t => {
    t.plan(8)

    const fastify = Fastify()
    fastify.register(
      require('./index'),
      { entry: './client.js', prefix, watch: false }
    )

    fastify.inject({
      url: '/test',
      method: 'GET'
    }, res => {
      t.equal(res.statusCode, 200)
      t.equal(res.payload, html)
    })

    fastify.inject({
      url: '/test/index.html',
      method: 'GET'
    }, res => {
      t.equal(res.statusCode, 200)
      t.equal(res.headers['content-type'], 'text/html')
    })

    fastify.inject({
      url: '/test/bundle.css',
      method: 'GET'
    }, res => {
      t.equal(res.statusCode, 200)
      t.equal(res.headers['content-type'], 'text/css')
    })

    fastify.inject({
      url: '/test/bundle.js',
      method: 'GET'
    }, res => {
      t.equal(res.statusCode, 200)
      t.equal(res.headers['content-type'], 'text/javascript')
    })
  })
}

testPrefix('/test')
testPrefix('/test/')
testPrefix('test')
testPrefix('test/')

test('should handle a given html file', t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entry: './client.js', html: './index.html', watch: false }
  )

  fastify.inject({
    url: '/',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 200)
    t.equal(res.payload, html)
  })
})

test('should return 404 if an assets is not found', t => {
  t.plan(1)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entry: './client.js', watch: false }
  )

  fastify.inject({
    url: '/file.php',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 404)
  })
})

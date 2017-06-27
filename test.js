'use strict'

const t = require('tap')
const test = t.test
const fs = require('fs')
const Fastify = require('fastify')
const html = fs.readFileSync('./index.html', 'utf8')

const options = { watch: false }

test('Should expose a route with the assets', t => {
  t.plan(9)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entryFile: './client.js', options }
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

test('should handle a base url', t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entryFile: './client.js', baseURL: '/test', options }
  )

  fastify.inject({
    url: '/test',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 200)
    t.equal(res.payload, html)
  })
})

test('should handle a given html file', t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entryFile: './client.js', html: './index.html', options }
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
    { entryFile: './client.js', options }
  )

  fastify.inject({
    url: '/file.php',
    method: 'GET'
  }, res => {
    t.equal(res.statusCode, 404)
  })
})

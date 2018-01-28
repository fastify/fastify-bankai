'use strict'

const t = require('tap')
const test = t.test
const Fastify = require('fastify')

test('expose a route with the assets', t => {
  t.plan(10)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entry: './client.js', watch: false, quiet: true }
  )
  t.teardown(fastify.close.bind(fastify))

  fastify.inject({
    url: '/',
    method: 'GET'
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.matchSnapshot(res.payload)
    t.equal(res.headers['content-type'], 'text/html')
  })

  fastify.inject({
    url: '/bundle.css',
    method: 'GET'
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'text/css')
  })

  fastify.inject({
    url: '/bundle.js',
    method: 'GET'
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/javascript')
  })
})

function testPrefix (prefix) {
  test('handle a prefix: ' + prefix, t => {
    t.plan(9)

    const fastify = Fastify()
    fastify.register(
      require('./index'),
      { entry: './client.js', prefix, watch: false }
    )
    t.teardown(fastify.close.bind(fastify))

    fastify.inject({
      url: '/test',
      method: 'GET'
    }, (err, res) => {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.matchSnapshot(res.payload)
    })

    fastify.inject({
      url: '/test/bundle.css',
      method: 'GET'
    }, (err, res) => {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.equal(res.headers['content-type'], 'text/css')
    })

    fastify.inject({
      url: '/test/bundle.js',
      method: 'GET'
    }, (err, res) => {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.equal(res.headers['content-type'], 'application/javascript')
    })
  })
}

testPrefix('/test')
testPrefix('/test/')
testPrefix('test')
testPrefix('test/')

test('handle a given html file', t => {
  t.plan(3)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entry: './client.js', html: './index.html', watch: false }
  )
  t.teardown(fastify.close.bind(fastify))

  fastify.inject({
    url: '/',
    method: 'GET'
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.matchSnapshot(res.payload)
  })
})

test('return 404 if an assets is not found', t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entry: './client.js', watch: false }
  )

  t.teardown(fastify.close.bind(fastify))

  fastify.inject({
    url: '/file.php',
    method: 'GET'
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 404)
  })
})

test('close if watch is true', t => {
  t.plan(4)

  const fastify = Fastify()
  fastify.register(
    require('./index'),
    { entry: './client.js' }
  )
  t.teardown(fastify.close.bind(fastify))

  fastify.inject({
    url: '/',
    method: 'GET'
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.matchSnapshot(res.payload)
    t.equal(res.headers['content-type'], 'text/html')
  })
})

test('error if entry is missing', t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(
    require('./index')
  )
  t.teardown(fastify.close.bind(fastify))

  fastify.ready((err) => {
    t.ok(err)
    t.equal(err.message, 'missing entry file')
  })
})

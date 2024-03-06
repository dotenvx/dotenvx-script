const t = require('tap')

const script = require('./../src/script')

t.test('hi', ct => {
  ct.same('hi', 'hi')

  ct.end()
})


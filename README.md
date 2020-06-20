[![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

synkronized
===========

> An interface / implementation for mutexing stuff

Installation
------------

    npm install --save synkronized

Usage
-----

`synkronized` is a Jamiroquai-themed interface also reminiscent of Java's `synchronized () {...}` blocks.
It provides an interface for running blocks of asynchronous code in mutual exclusion of other
blocks.

```javascript
synkronized('checkout', async () => {
  const basket = await getBasket()
  const price = await computePrice(basket)
  const receipt = await charge(price)
  return receipt // this value is also returned from the synkronized block
})
```

A `synkronized` block has two main specifities :

+ an identifier
+ a locking strategy which is optional

`synkronized` ships with a simple in-memory strategy which synchronises blocks running
within the same node.js process.

However you can specify a strategy by providing an implementation as the first argument

```javascript
const redisLockStrategy = new RedisLockStrategy(conenctionString)
synkronized(redisLockStrategy, 'checkout', async () => {
  const basket = await getBasket()
  await computePrice(basket)
  await charge(price)
})
```

If your strategy accepts options by lock (other than the identifier), then it can become the second argument

```javascript
const redisLockStrategy = new RedisLockStrategy(conenctionString)
synkronized(redisLockStrategy, { timeout: 5000 }, 'checkout', async () => {
  const basket = await getBasket()
  const price = await computePrice(basket)
  await charge(price)
})
```

`synkronized` is meant to be composed to better suit your needs. This is why it is designed to be
curried (partially applied)

```javascript
const pgSynkronized = synkronized.bind(null, new PgLockStrategy(connectionString, schema))
const readonlySynkronized = pgSynkronized.bind(null, { readonly: true })
const readlockedBasket = readonlySynkronized.bind(null, 'basket')

readlockedBasket(async () => {
  const basket = await getBasket()
})
```


Reference
---------



Debugging
---------

`Bulkage` uses the [`debug`](https://www.npmjs.com/package/debug) module to trace its behaviour. Start your
program with environment `DEBUG=synkronized` or `DEBUG=synkronized:trace` to see what is going on.

Test
----

You can run the tests with `npm test`. You will need to know [mocha][mocha-url]

Contributing
------------

Anyone is welcome to submit issues and pull requests


License
-------

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[travis-image]: http://img.shields.io/travis/Floby/synkronized/master.svg?style=flat
[travis-url]: https://travis-ci.org/Floby/synkronized
[coveralls-image]: http://img.shields.io/coveralls/Floby/synkronized/master.svg?style=flat
[coveralls-url]: https://coveralls.io/r/Floby/synkronized
[mocha-url]: https://github.com/visionmedia/mocha

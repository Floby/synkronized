import sinon from 'sinon'
import Deferred from '../src/deferred'
import { expect } from 'chai'
import synkronized from '../src/index'
require('chai').use(require('sinon-chai'))
require('chai').use(require('chai-as-promised'))


describe('synkronized(id, block)', () => {
  const id = 'lock'
  it('calls block', async () => {
    // Given
    const block = sinon.spy()
    // When
    await synkronized(id, block)
    // Then
    expect(block).to.have.callCount(1)
  })
  it('resolves the return value', async () => {
    // Given
    const expected = {}
    const block = sinon.stub().returns(expected)
    // When
    const actual = synkronized(id, block)
    // Then
    expect(actual).to.be.a.instanceOf(Promise)
    await expect(actual).to.eventually.equal(expected)
  })
  it('resolves the resolved value', async () => {
    // Given
    const expected = {}
    const block = sinon.stub().resolves(expected)
    // When
    const actual = synkronized(id, block)
    // Then
    expect(actual).to.be.a.instanceOf(Promise)
    await expect(actual).to.eventually.equal(expected)
  })
  it('infers the type of the block', () => {
    let n: Promise<number>
    n = synkronized(id, () => {
      return 8
    })
    n = synkronized(id, () => {
      return Promise.resolve(9)
    })
    return n
  })
  context('a second block', () => {
    it('waits for the first one to be done', async () => {
      // Given
      let aRunning = false
      let bRunning = false
      let aDone = new Deferred()
      const a = synkronized(id, async () => {
        aRunning = true
        await aDone.promise
      })
      // When
      const b = synkronized(id, async () => {
        bRunning = true
      })
      await nextTick()
      // Then
      expect(aRunning).to.equal(true)
      expect(bRunning).to.equal(false)
      aDone.resolve(undefined)
      await a
      expect(bRunning).to.equal(true)
      await b
    })
  })
})

async function nextTick () {
  return new Promise((resolve) => {
    setImmediate(resolve)
  })
}

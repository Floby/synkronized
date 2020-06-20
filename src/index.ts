import Deferred from './deferred'
import shortid from 'shortid'
const debug = require('debug')('synkronized')

export default async function synkronized<R extends any> (id: string, block: () => (R) | Promise<R>): Promise<R> {
  const blockId = shortid()
  debug('(%s) ACQUIRING "%s"', blockId, id)
  const lock = await defaultStrategy.acquireLock(id)
  debug('(%s) ACQUIRED "%s"', blockId, id)
  const result = await block()
  debug('(%s) RELEASING "%s"', blockId, id)
  await defaultStrategy.releaseLock(lock)
  debug('(%s) RELEASED "%s"', blockId, id)
  return result
}


export interface LockStrategy<L, O=void> {
  acquireLock(id: LockStrategy.ID, options?: O): Promise<L>
  releaseLock(lock: L): Promise<void>
}
export namespace LockStrategy {
  export type ID = string
}

class InMemoryStrategy implements LockStrategy<Deferred<any>> {
  private leases = new Map<LockStrategy.ID, Promise<any>>()

  async acquireLock (id: LockStrategy.ID): Promise<Deferred<any>> {
    let currentLease: Promise<void> | void
    while (currentLease = this.leases.get(id)) {
      await currentLease
    }
    const myLock = new Deferred()
    const myLease = myLock.promise.then(() => this.leases.delete(id))
    this.leases.set(id, myLease)
    return myLock
  }

  async releaseLock (lock: Deferred<void>) {
    await lock.resolve()
  }
}
const defaultStrategy = new InMemoryStrategy()

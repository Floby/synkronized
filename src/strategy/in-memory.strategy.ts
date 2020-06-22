import Deferred from '../deferred'
import { LockStrategy } from './index'

export class InMemoryStrategy implements LockStrategy<Deferred<any>> {
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

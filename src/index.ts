import shortid from 'shortid'
import { InMemoryStrategy } from './strategy/in-memory.strategy'
const debug = require('debug')('synkronized')

const defaultStrategy = new InMemoryStrategy()

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


export interface LockStrategy<L, O=void> {
  acquireLock(id: LockStrategy.ID, options?: O): Promise<L>
  releaseLock(lock: L): Promise<void>
}
export namespace LockStrategy {
  export type ID = string
}



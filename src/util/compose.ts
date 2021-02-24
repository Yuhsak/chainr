import type { Chain, ChainParams, ChainReturn } from '../chainr'
import { chainr } from '../chainr'
import { merge } from './merge'

export type Compose = <C extends Chain<(...args: any[]) => object>>(...chains: C[]) => Chain<(...arg: ChainParams<C>) => ChainReturn<C>>

export const compose: Compose = (...chains) => {
  const fns = chains.map((chain) => chain())
  return chainr((...args: any[]): any => {
    return fns
      .map((fn) => fn(...args))
      .reduce((acc, r) => {
        if (acc instanceof Promise) {
          return acc.then((p1) => {
            if (r instanceof Promise) {
              return r.then((p2) => merge(p1, p2))
            }
            return merge(p1, r)
          })
        }
        if (r instanceof Promise) {
          return r.then((p2) => merge(acc, p2))
        }
        return merge(acc, r)
      }, {})
  })
}

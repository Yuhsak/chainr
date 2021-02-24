import type { Fn, PromiseContent, PromiseOnce } from './types'

export type Chain<F extends Fn> = {
  <N>(next: (arg: PromiseContent<ReturnType<F>>) => N): (...args: Parameters<F>) => ReturnType<F> extends Promise<any> ? PromiseOnce<N> : N
  (): F
}

export type Chainr = {
  <F extends Fn>(resolver: F): Chain<F>
  <A, R>(resolver: (arg: A) => Promise<R>): Chain<typeof resolver>
  <A, R>(resolver: (arg: A) => R): Chain<typeof resolver>
}

export const chainr: Chainr = <F extends Fn>(resolver: F) => {
  return <N>(next?: (arg: PromiseContent<ReturnType<F>>) => N) => (...args: Parameters<F>) => {
    const r = resolver(...args)
    return next ? (r instanceof Promise ? r.then(next) : next(r)) : r
  }
}

export type TypedChainr<A, R = A> = {
  (resolver: (arg: A) => Promise<R>): Chain<typeof resolver>
  (resolver: (arg: A) => R): Chain<typeof resolver>
}

export type ChainContent<F extends Chain<Fn>> = F extends Chain<infer U> ? U : any
export type ChainParams<F extends Chain<Fn>> = Parameters<ChainContent<F>>
export type ChainReturn<F extends Chain<Fn>> = ReturnType<ChainContent<F>>
export type Chainable<F extends Chain<Fn>> = Chain<(arg: PromiseContent<ChainReturn<F>>) => any>

import type {
  Resolver,
  MultiArgResolver,
  SomePromise,
  PromiseOnce,
} from '../types'

import type {
  Chain,
  ChainParams,
  ChainReturn,
  Chainable,
} from '../chainr'

import {
  chainr
} from '../chainr'

export type Pipe = {
  <C1 extends Chain<any>, C2 extends Chainable<C1>>(c1: C1, c2: C2): Chain<(...args: ChainParams<C1>) => SomePromise<[ChainReturn<C1>, ChainReturn<C2>]> extends never ? ChainReturn<C2> : PromiseOnce<ChainReturn<C2>>>
  <C1 extends Chain<any>, C2 extends Chainable<C1>, C3 extends Chainable<C2>>(c1: C1, c2: C2, c3: C3): Chain<(...args: ChainParams<C1>) => SomePromise<[ChainReturn<C1>, ChainReturn<C2>, ChainReturn<C3>]> extends never ? ChainReturn<C3> : PromiseOnce<ChainReturn<C3>>>
  <C1 extends Chain<any>, C2 extends Chainable<C1>, C3 extends Chainable<C2>, C4 extends Chainable<C3>>(c1: C1, c2: C2, c3: C3, c4: C4): Chain<(...args: ChainParams<C1>) => SomePromise<[ChainReturn<C1>, ChainReturn<C2>, ChainReturn<C3>, ChainReturn<C4>]> extends never ? ChainReturn<C4> : PromiseOnce<ChainReturn<C4>>>
  <C1 extends Chain<any>, C2 extends Chainable<C1>, C3 extends Chainable<C2>, C4 extends Chainable<C3>, C5 extends Chainable<C4>>(c1: C1, c2: C2, c3: C3, c4: C4, c5: C5): Chain<(...args: ChainParams<C1>) => SomePromise<[ChainReturn<C1>, ChainReturn<C2>, ChainReturn<C3>, ChainReturn<C4>, ChainReturn<C5>]> extends never ? ChainReturn<C5> : PromiseOnce<ChainReturn<C5>>>
}

export const pipe:Pipe = <T extends Chain<any>>(...chains: T[]) => chainr(
  chains.reverse().reduce<Resolver<any, any>>((a, b) => b(a), void(0) as any)
)

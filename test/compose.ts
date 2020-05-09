import {
  chainr,
  compose,
  TypedChainr
} from '../src'

type O = Record<string, number|object>

describe('compose', () => {

  test('works', () => {

    const tChainr:TypedChainr<string, O> = chainr

    const c1 = tChainr((arg: string) => ({c1: arg.length}))
    const c2 = tChainr((arg: string) => ({c2: arg.length}))
    const c3 = tChainr((arg: string) => ({c3: arg.length}))

    const cp = compose(c1, c2, c3)

    expect(cp()('1')).toStrictEqual({c1: 1, c2: 1, c3: 1})

  })

  test('async', async () => {

    const tChainr:TypedChainr<string, O> = chainr

    const c1 = tChainr(async (arg: string) => ({c1: arg.length}))
    const c2 = tChainr(async (arg: string) => ({c2: arg.length}))
    const c3 = tChainr(async (arg: string) => ({c3: arg.length}))

    const cp = compose(c1, c2, c3)

    await expect(cp()('1')).resolves.toStrictEqual({c1: 1, c2: 1, c3: 1})

  })

})
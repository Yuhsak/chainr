import { chainr, pipe, compose, TypedChainr } from '../src'

describe('pipe', () => {
  test('works', () => {
    const c1 = chainr((arg: string) => arg + 'c1')
    const c2 = chainr((arg: string) => arg + 'c2')

    // same as chainr(c1(c2()))
    const p1 = pipe(c1, c2)
    const c1p1 = c1(p1())

    expect(c1p1('a')).toEqual('ac1c1c2')

    const ub = chainr(() => false)
    const bn = chainr((arg: boolean) => 100)
    const ns = chainr((arg: number) => 'cns')
    const sb = chainr((arg: string) => true)

    const p2 = pipe(ub, bn, ns, sb)

    const c3 = chainr((arg: boolean) => 'ok')

    const p2c3 = p2(c3())

    expect(p2c3()).toEqual('ok')
  })

  test('async', async () => {
    const c1 = chainr((arg: string) => arg + 'c1')
    const c2 = chainr(async (arg: string) => arg + 'c2')
    const c3 = chainr((arg: string) => arg + 'c3')

    // same as chainr(c1(c2(c3())))
    const p = pipe(c1, c2, c3)

    await expect(p()('a')).resolves.toEqual('ac1c2c3')
  })

  test('with compose', () => {
    const chnr: TypedChainr<Record<string, number>> = chainr

    const c1 = chnr((obj) => ({ ...obj, c1: Object.keys(obj).length }))
    const c2 = chnr((obj) => ({ ...obj, c2: Object.keys(obj).length }))
    const c3 = chnr((obj) => ({ ...obj, c3: Object.keys(obj).length }))
    const c4 = chnr((obj) => ({ ...obj, c4: Object.keys(obj).length }))
    const c5 = chnr((obj) => ({ ...obj, c5: Object.keys(obj).length }))

    const cp1 = compose(c1, c2)
    const pp1 = pipe(c3, c4)

    const cp1pp1 = chnr(cp1(pp1()))

    const cp1pp1c5 = cp1pp1(c5())

    expect(cp1pp1c5({})).toStrictEqual({ c1: 0, c2: 0, c3: 2, c4: 3, c5: 4 })
  })
})

import {
  chainr,
  TypedChainr,
} from '../src'

type TestObj = {
  [K in string]: number
}

describe('chainr', () => {

  test('executed in order', () => {

    const c0 = chainr((arg: TestObj) => ({...arg, c0: Object.keys(arg).length}))
    const c1 = chainr((arg: TestObj) => ({...arg, c1: Object.keys(arg).length}))
    const c2 = chainr((arg: TestObj) => ({...arg, c2: Object.keys(arg).length}))
    const c3 = chainr((arg: TestObj) => ({...arg, c3: Object.keys(arg).length}))

    const cc0 = c0(c1(c2(c3())))
    const cc1 = c2(c0(c3(c1())))

    expect(cc0({})).toStrictEqual({c0: 0, c1: 1, c2: 2, c3: 3})
    expect(cc1({})).toStrictEqual({c0: 1, c1: 3, c2: 0, c3: 2})

  })

  test('async', async () => {

    const syn = chainr((arg:string) => arg + 's')
    const asyn = chainr(async (arg:string) => arg + 'a')

    const sss = syn(syn(syn()))
    const ass = asyn(syn(syn()))
    const sas = syn(asyn(syn()))
    const ssa = syn(syn(asyn()))
    const saa = syn(asyn(asyn()))
    const asa = asyn(syn(asyn()))
    const aas = asyn(asyn(syn()))
    const aaa = asyn(asyn(asyn()))

    expect(sss('')).toEqual('sss')
    expect(ass('')).not.toEqual('ass')
    await expect(ass('')).resolves.toEqual('ass')
    await expect(sas('')).resolves.toEqual('sas')
    await expect(ssa('')).resolves.toEqual('ssa')
    await expect(saa('')).resolves.toEqual('saa')
    await expect(asa('')).resolves.toEqual('asa')
    await expect(aas('')).resolves.toEqual('aas')
    await expect(aaa('')).resolves.toEqual('aaa')

  })

  test('typing', () => {

    const typed0:TypedChainr<{num: number}, {num: number}> = chainr
    const typed1:TypedChainr<{num: number}> = chainr

    const c0 = typed0(arg => ({num: arg.num+1}))
    const c1 = typed1(arg => ({num: arg.num+1}))
    const c2 = chainr<(arg: {num: number}) => {num: number}>(arg => ({num: arg.num+1}))
    const c3 = chainr((arg: ({num: number})) => ({num: arg.num+1}))

    expect(c0(c1(c2(c3())))({num: 0})).toStrictEqual({num: 4})

  })

})
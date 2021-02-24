import { chainr, finalizr } from '../src'

type FetchParams = { url: string; payload?: object; method?: string; body?: string; headers?: object }

const qs2obj = <T = object>(qs: string): T =>
  encodeURI(qs)
    .split('&')
    .map((part) => part.split(/^(.*?)=/))
    .reduce<T>((acc, [, k, v]) => ({ ...acc, [k]: v }), {} as T)

const obj2qs = <T = object>(obj: T) =>
  Object.keys(obj)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent((obj as any)[k as any]))
    .join('&')

describe('finalizr', () => {
  test('works', () => {
    const finalize = finalizr((arg: { c1: number; c2: number }) => ({ ...arg, f: Math.max(arg.c1, arg.c2) + 1 }))
    const c1 = chainr((arg: {}) => ({ c1: Object.keys(arg).length + 1 }))
    const c2 = chainr((arg: { c1: number }) => ({ ...arg, c2: Object.keys(arg).length + 1 }))
    const handle = () => ({})

    const f = finalize(c1(c2()))
    const result = f(handle)

    expect(result()).toStrictEqual({ c1: 1, c2: 2, f: 3 })
  })

  test('async', async () => {
    const fa = finalizr(async (arg: string) => arg + 'fa')
    const fs = finalizr((arg: string) => arg + 'fs')
    const a = chainr(async (arg: string) => arg + 'a')
    const s = chainr((arg: string) => arg + 's')
    const ha = async (...args: string[]) => args.join('') + 'ha'
    const hs = (...args: string[]) => args.join('') + 'hs'

    const targets = [
      fa(a(a()))(ha),
      fa(a(a()))(hs),
      fa(s(a()))(ha),
      fa(s(a()))(hs),
      fa(a(s()))(ha),
      fa(a(s()))(hs),
      fa(s(s()))(ha),
      fa(s(s()))(hs),
      fs(a(a()))(ha),
      fs(a(a()))(hs),
      fs(s(a()))(ha),
      fs(s(a()))(hs),
      fs(a(s()))(ha),
      fs(a(s()))(hs),
      fs(s(s()))(ha),
    ]

    await expect(Promise.all(targets.map((f) => f('b')))).resolves.toStrictEqual([
      'bhaaafa',
      'bhsaafa',
      'bhasafa',
      'bhssafa',
      'bhaasfa',
      'bhsasfa',
      'bhassfa',
      'bhsssfa',
      'bhaaafs',
      'bhsaafs',
      'bhasafs',
      'bhssafs',
      'bhaasfs',
      'bhsasfs',
      'bhassfs',
    ])
  })

  test('typing', () => {
    const finalize = finalizr((arg: string) => arg + 'f')
    const c1 = chainr((arg: string) => arg + 'c1')
    const c2 = chainr((arg: string) => arg + 'c2')
    const handle = (...args: string[]) => args.join('')

    const f = finalize(c1(c2()))
    const result1 = f(handle)
    const result2 = f<string, string>(handle)

    expect(result1('a', 'b', 'c')).toEqual('abcc1c2f')
    expect(result2('a')).toEqual('ac1c2f')
  })

  test('complex example', () => {
    const fetch = finalizr((arg: FetchParams) => arg)

    const asGet = chainr((arg: FetchParams) => ({ ...arg, method: 'GET' }))
    const asPost = chainr((arg: FetchParams) => ({ ...arg, method: 'POST' }))

    const withPayload = chainr((arg: FetchParams) => {
      if (!arg.payload) return arg
      if (!arg.method || ['GET', 'DELETE'].includes(arg.method)) {
        const url = arg.url + '?' + obj2qs(arg.payload)
        return { ...arg, url }
      } else {
        const body = JSON.stringify(arg.payload)
        return { ...arg, body }
      }
    })

    const get = fetch(asGet(withPayload()))
    const post = fetch(asPost(withPayload()))

    type Endpoint = Record<string, (...args: any[]) => string>

    const endpoint = {
      me: () => '/me',
      entry: (arg: { id: string }) => `/entry/${arg.id}`,
    }

    type EndpointHandler<T extends Endpoint> = { [K in keyof T]: (...args: Parameters<T[K]>) => FetchParams }

    const createHandler = <T extends Endpoint>(endpoint: T): EndpointHandler<T> =>
      Object.keys(endpoint)
        .map((k) => {
          const f = endpoint[k]
          return [k, (...args: Parameters<typeof f>) => ({ url: f(...args), payload: args[0] })] as const
        })
        .reduce<EndpointHandler<T>>((acc, [k, f]) => ({ ...acc, [k]: f }), {} as any)

    const handler = createHandler(endpoint)

    const me = get(handler.me)
    const getEntry = get(handler.entry)
    const postEntry = post<{ id: string; title: string }, FetchParams>(handler.entry)

    expect(me()).toStrictEqual({ url: '/me', method: 'GET', payload: undefined })
    expect(getEntry({ id: '1' })).toStrictEqual({ url: '/entry/1?id=1', method: 'GET', payload: { id: '1' } })
    expect(postEntry({ id: '1', title: 'test' })).toStrictEqual({
      url: '/entry/1',
      method: 'POST',
      payload: { id: '1', title: 'test' },
      body: '{"id":"1","title":"test"}',
    })
  })
})

# chainr
Lightweight util for function composition

## install

```sh
$ npm i chainr
```

## usage

### basics

```ts
import { chainr } from 'chainr'

const c1 = chainr((arg1: string) => arg1 + '_c1')
const c2 = chainr((arg2: string) => arg2 + '_c2')

// fn = (arg1: string) => string
const fn = c1(c2())

// result = 'start_c1_c2'
const result = fn('start')

// async function
const asyn = chainr(async (arg: string) => arg + '_async')
const syn = chainr((arg: string) => arg + '_sync')

// can be mixed
const mixedFn = syn(asyn(asyn(syn())))

// result2 = Promise<string>
const result2 = mixedFn('start')

// 'start_sync_async_async_sync'
result2.then(res => console.log(res))
```

### typing

```ts
import { chainr, TypedChainr } from 'chainr'

// TypedChainr<Input, Output>
const typed:TypedChainr<string, string> = chainr

const c1 = typed(arg => arg.length + 1 )
```

### small example

```ts
import { chainr } from 'chainr'

type ReqParam = {
  url: string,
  method?: 'GET' | 'POST'
}

const asObject = chainr((url: string) => ({url}))

const asGet = chainr((param: ReqParam) => ({...param, method: 'GET' as const}))
const asPost = chainr((param: ReqParam) => ({...param, method: 'POST' as const}))

// createGetParam = (url: string) => {url: string, method: 'GET'}
const createGetParam = asObject(asGet())
// createPostParam = (url: string) => {url: string, method: 'POST'}
const createPostParam = asObject(asPost())

// getParam = {url: '/profile', method: 'GET'}
const getParam = createGetParam('/profile')
// postParam = {url: '/profile', method: 'POST'}
const postParam = createGetParam('/profile')
```

### give in/out interface

```ts
import { chainr, finalizr } from 'chainr'

type ReqParam = {
  url: string,
  method?: 'GET' | 'POST',
  payload?: object,
  body?: string
}

const fetchAsJson = finalizr((param: ReqParam) => {
  const {method, body} = param
  return fetch(param.url, {method, body})
    .then(res => res.json())
})

const asGet = chainr((param: ReqParam) => ({...param, method: 'GET'}))
const asPost = chainr((param: ReqParam) => ({...param, method: 'POST'}))

const withBody = chainr((param: ReqParam) => ({...param, body: JSON.stringify(param.payload)}))

const get = fechAsJson(asGet())
const post = fechAsJson(asPost(withBody()))

const endpoint = {
  me: () => ({url: '/me'}),
  entry: (payload: {id: string}) => ({url: `/entry/${payload.id}`, payload})
}

// getMe = () => Promise<any>
const getMe = get(endpoint.me)
// getEntry = (payload: {id: string}) => Promise<{content: object}>
const getEntry = get<{content: object}>(endpoint.entry)
// postEntry = (arg: {id: string, content: object}) => Promise<{success: boolean}>
const postEntry = get<{id: string, content: object}, {success: boolean}>(endpoint.entry)
```

### composition utils

```ts
import { chainr, pipe, compose } from 'chainr'

const chnr:TypedChainr<Record<string, number>> = chainr

const c1 = chnr(obj => ({...obj, c1: Object.keys(obj).length}))
const c2 = chnr(obj => ({...obj, c2: Object.keys(obj).length}))
const c3 = chnr(obj => ({...obj, c3: Object.keys(obj).length}))
const c4 = chnr(obj => ({...obj, c4: Object.keys(obj).length}))
const c5 = chnr(obj => ({...obj, c5: Object.keys(obj).length}))

// parallel
// same as chainr(obj => ({...c1()(obj), ...c2()(obj)}))
const cp1 = compose(c1, c2)

// sequence
// same as chainr(c3(c4()))
const pp1 = pipe(c3, c4)

const cp1pp1 = chnr(cp1(pp1()))

const cp1pp1c5 = cp1pp1(c5())

// result = {c1: 0, c2: 0, c3: 2, c4: 3, c5: 4}
const result = cp1pp1c5({})
```
import {
  merge,
} from '../src'

type O = Record<string, number>
type OD = Record<string, number | object>

describe('merge', () => {

  test('works', () => {

    const o1:O = {a: 1, b: 2}
    const o2:O = {c: 3}

    expect(merge(o1, o2)).toEqual({a: 1, b: 2, c: 3})

  })

  test('extend', () => {

    const o1:O = {a: 1, b: 2}
    const o2:O = {b: 3, c: 4}

    expect(merge(o1, o2)).toEqual({a: 1, b: 3, c: 4})

  })

  test('deep', () => {

    const o1:OD = {a: 1, b: {c: 2, d: 3, e: {f: 4, g: 5}}}
    const o2:OD = {b: {c: 4, e: {f: 6, h: 7, i: {j: 8}}}}

    expect(merge(o1, o2)).toStrictEqual({a: 1, b: {c: 4, d: 3, e: {f: 6, g: 5, h: 7, i: {j: 8}}}})

  })

})
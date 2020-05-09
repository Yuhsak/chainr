export const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj)

export const merge = <T>(target: T, source: T):T => {
  const result = {...target}
  Object.keys(source).forEach(k => {
    const key = k as keyof T
    const vt = target[key]
    const vs = source[key]
    if(isObject(vt) && isObject(vs)) {
      result[key] = merge(vt, vs)
    } else {
      result[key] = source[key]
    }
  })
  return result
}
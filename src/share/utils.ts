export const warn = (
  message: string,
  isWarn?: boolean
) => {
  message = `\n[SDK warn]: ${message}\n\n`
  if (isWarn) {
    console.warn(message)
    return
  }
  throw new Error(message)
}

export const assert = (
  condition: boolean,
  error: string
) => {
  if (!condition) warn(error)
}

export const isUndef = v => {
  return v === null || v === undefined
}

export const once = <T extends (...args: Array<any>) => any>(
  fn: T
) => {
  let first = true
  function wrap (...args) {
    if (!first) return
    first = false
    return fn.apply(this, args)
  }
  return wrap as T
}

export const callHook = (
  hooks: Object | undefined | null,
  name: string,
  params: Array<any>,
) => {
  if (hooks && typeof hooks[name] === 'function') {
    return hooks[name].apply(hooks, params)
  }
  return null
}

export const remove = (list: Array<any>, item:any) => {
  const index = list.indexOf(item)
  if (~index) {
    list.splice(index, 1)
  }
}

export const createWraper = <T extends (...args: Array<any>) => any>(
  target?: T,
  before?: T,
  after?: T,
) => {
  function wrap (...args) {
    let result
    if (typeof before === 'function') {
      before.apply(this, args)
    }
    if (typeof target === 'function') {
      result = target.apply(this, args)
    }
    if (typeof after === 'function') {
      after.apply(this, args)
    }
    return result
  }
  return wrap as T
}

export const isPlainObject = obj => {
  if (typeof obj !== 'object' || obj === null) return false

  const proto = Object.getPrototypeOf(obj)
  if (proto === null) return true

  let baseProto = proto
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto)
  }
  return proto === baseProto
}

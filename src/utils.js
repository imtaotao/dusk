export const warn = (message, isWarn) => {
  message = `\n[ReportSDK warn]: ${message}\n\n`
  if (isWarn) {
    console.warn(message)
    return
  }
  throw new Error(message)
}

export const assert = (condition, error) => {
  if (condition) {
    warn(error)
  }
}

export const isUndef = v => {
  return v === null || v === undefined
}

export const once =  (fn) => {
  let first = true
  return function (...args) {
    if (!first) return
    first = false
    fn.apply(this, args)
  }
}

export const callHook = (hooks, name, params) => {
  if (hooks && typeof hooks[name] === 'function') {
    return hooks[name].apply(hooks, params)
  }
  return null
}

export const remove = (list, item) => {
  const index = list.indexOf(item)
  if (~index) {
    list.splice(index, 1)
  }
}

export const createWraper = (target, fn) => {
  return function (...args) {
    fn.apply(this, args)
    if (typeof target === 'function') {
      return target.apply(this, args)
    }
  }
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

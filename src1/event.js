function getEventModule (instance, type) {
  return instance._listener[type] || (
    instance._listener[type] = {
      once: [],
      normal: [],
    }
  )
}

export default class Event {
  constructor() {
    this._listener = Object.create(null)
  }

  on (type, fn) {
    if (typeof type !== 'string' &&
      typeof fn !== 'function') {
      return false
    }
    getEventModule(this, type).normal.push(fn)
    return true
  }

  once (type, fn) {
    if (typeof type !== 'string' &&
      typeof fn !== 'function') {
      return false
    }
    getEventModule(this, type).once.push(fn)
    return true
  }

  off (type, fn) {
    const eventModule = this._listener[type]

    if (eventModule) {
      if (typeof fn === 'function') {
        let index = -1
        const { once, normal } = eventModule

        if (~(index = once.indexOf(fn))) {
          once.splice(index, 1)
        }
        if (~(index = normal.indexOf(fn))) {
          once.splice(index, 1)
        }
      } else if (fn === undefined) {
        eventModule.once = []
        eventModule.normal = []
      }
      return true
    }
    return false
  }

  offAll () {
    this._listener = Object.create(null)
  }

  // data 是个数组
  emit (type, data) {
    const eventModule = this._listener[type]
    if (eventModule) {
      eventModule.once.forEach(fn => fn.apply(this, data))
      eventModule.once = []
      eventModule.normal.forEach(fn => fn.apply(this, data))
      return true
    }
    return false
  }
}
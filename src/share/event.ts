interface EventItem {
  once: Array<Function>
  normal: Array<Function>
}

interface Listener  {
  [key: string]: EventItem
}

function getEventModule (
  instance: Event,
  type: string
) : EventItem {
  return instance._listener[type] || (
    instance._listener[type] = {
      once: [],
      normal: [],
    }
  )
}

export default class Event {
  public _listener: Listener = Object.create(null)

  public on (type: string, fn: Function) {
    if (typeof type !== 'string' &&
      typeof fn !== 'function') {
      return false
    }
    getEventModule(this, type).normal.push(fn)
    return true
  }

  public once (type: string, fn: Function) {
    if (typeof type !== 'string' &&
      typeof fn !== 'function') {
      return false
    }
    getEventModule(this, type).once.push(fn)
    return true
  }

  public off (type: string, fn?: Function) {
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

  public offAll () {
    this._listener = Object.create(null)
  }

  // data 是个数组
  public emit (
    type: string,
    data: Array<any> = []
  ) {
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
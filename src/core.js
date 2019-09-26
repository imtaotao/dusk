import { assert, isUndef, callHook } from './utils'

export default class SDK {
  constructor (opts) {
    this.opts = opts
    this.hooks = opts.hooks
    this.depComponents = new Map()
    this.timeStack = Object.create(null)
  }

  time (type) {
    if (typeof type === 'string') {
      if (isUndef(this.timeStack[type])) {
        this.timeStack[type] = Date.now()
      }
    }
  }

  timeEnd (type, fn) {
    if (typeof type === 'string') {
      if (!isUndef(this.timeStack[type])) {
        const duration = Date.now() - this.timeStack[type]
        typeof fn === 'function' && fn(duration)
        this.timeStack[type] = null
        return duration
      }
    }
    return null
  }

  // 调用数据上报的钩子
  // 网络请求等具体的副作用暴露给外部
  report (key, payload) {
    const [success, res] = callHook(this.hooks, 'report', [key, payload])
    assert(!success, 'The [report] hooks is not defined.')
    return res
  }
}
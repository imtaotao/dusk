import Router from './router'
import code, { reportCodes } from './report-code'
import { warn, assert, isUndef, callHook, createWraper } from './utils'

export default class SDK {
  constructor (opts) {
    this.opts = opts
    this.reportStack = {}
    this.hooks = opts.hooks
    this.depComponents = new Map()
    this.router = new Router(this)
    this.installedPlugins = new Set()
    this.timeStack = Object.create(null)
  }

  time (type) {
    if (typeof type === 'string') {
      if (isUndef(this.timeStack[type])) {
        this.timeStack[type] = Date.now()
      } else {
        warn(`Timer [${type}] already exists.`, true)
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
    } else {
      warn(`Timer [${type}] does not exist.`, true)
    }
    return null
  }

  // 调用数据上报的钩子
  // 网络请求等具体的副作用暴露给外部
  report (key, payload) {
    key = code(key)

    if (isUndef(this.reportStack[key])) {
      this.reportStack[key] = [payload]
      // 延迟 200ms 做批量上报
      setTimeout(() => {
        callHook(this.hooks, 'report', [key, this.reportStack[key]])
        this.reportStack[key] = null
      }, 200)
    } else {
      this.reportStack[key].push(payload)
    }
  }

  // 用于重写一个方法
  wraper (obj, name, fn) {
    assert(!(name in obj), 'The method that needs to be wrapped is not a function')
    obj[name] = createWraper(obj[name], fn)
  }

  // 插件
  use (plugin, ...args) {
    if (this.installedPlugins.has(plugin)) {
      return
    }

    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else {
      plugin.apply(null, args)
    }
    this.installedPlugins.add(plugin)
  }
}

// 上报状态码表
SDK._reportCodes = reportCodes
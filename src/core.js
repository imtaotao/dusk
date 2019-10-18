import {
  once,
  warn,
  assert,
  isUndef,
  callHook,
  createWraper,
  isPlainObject,
} from './utils'
import Event from './event'
import Router from './router'
import handleConfigHooks from './handle-config'
import {getCode, addCode, reportCodes} from './report-code'

export default class SDK extends Event {
  constructor(opts) {
    this.opts = opts
    this.reportStack = {}
    this.hooks = opts.hooks
    this.reportTimeout = 200
    this.depComponents = new Map()
    this.router = new Router(this)
    this.reportCodes = reportCodes
    this.installedPlugins = new Set()
    this.timeStack = Object.create(null)
  }

  // 创建一个只调用一次的函数
  once(fn) {
    return once(fn)
  }

  // 用于包装一个方法
  wraper(target, fn) {
    return createWraper(target, fn)
  }

  addCode(key, code) {
    addCode(key, code)
  }

  time(type) {
    if (typeof type === 'string') {
      if (isUndef(this.timeStack[type])) {
        this.timeStack[type] = Date.now()
      } else {
        warn(`Timer [${type}] already exists.`, true)
      }
    }
  }

  timeEnd(type, fn) {
    if (typeof type === 'string') {
      const value = this.timeStack[type]

      if (!isUndef(value)) {
        const duration = Date.now() - value
        typeof fn === 'function' && fn(duration)
        this.timeStack[type] = null
        return duration
      } else {
        warn(`Timer [${type}] does not exist.`, true)
      }
    }
    return null
  }


  // 调用数据上报的钩子
  // 网络请求等具体的副作用暴露给外部
  report(key, payload) {
    const {
      reportStack,
      reportTimeout,
    } = this
    const code = getCode(key)
    const value = reportStack[code]

    if (isUndef(value)) {
      reportStack[code] = [payload]

      // 延迟 200ms 做批量上报
      setTimeout(() => {
        this.emit('report', [key, value])
        callHook(this.hooks, 'report', [key, value])
        
        reportStack[code] = null
      }, reportTimeout)
    } else if (!isUndef(payload)) {
      value.push(payload)
    }
  }

  // 插件
  addPlugin(plugin, ...args) {
    assert(
      !this.installedPlugins.has(plugin),
      'Don\'t repeat install plugin',
    )

    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else {
      plugin.apply(null, args)
    }
    this.installedPlugins.add(plugin)
  }

  /**
   * 调用 setData 会调用此函数
   * 开发者手动调用也可以
   * @param component
   * @param data 用户自定义参数
   */
  update(component, fnName, params, isSetData) {
    assert(
      !isUndef(component),
      'Missing component',
    )

    const isPage = this.depComponents.get(component)
    const canProcessCfg = isPlainObject(component.SDKConfig)
    const emitData = [this, component, isPage]

    if (canProcessCfg) {
      handleConfigHooks.update({
        fnName,
        params,
        isPage,
        isSetData,
        component,
        sdk: this,
        SDKConfig: component.SDKConfig,
      })
    }

    this.emit('update', emitData)
    callHook(this.hooks, 'update', emitData)
  }
}

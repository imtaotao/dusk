import {
  warn,
  assert,
  isUndef,
  callHook,
  createWraper,
  isPlainObject,
} from './utils'
import Router from './router'
import handleConfigHooks from './handle-config'
import {getCode, addCode, reportCodes} from './report-code'

export default class SDK {
  constructor(opts) {
    this.opts = opts
    this.reportStack = {}
    this.hooks = opts.hooks
    this.depComponents = new Map()
    this.router = new Router(this)
    this.installedPlugins = new Set()
    this.timeStack = Object.create(null)
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
      if (!isUndef(this.timeStack[type])) {
        const duration = Date.now() - this.timeStack[type]
        typeof fn === 'function' && fn(duration)
        this.timeStack[type] = null
        return duration
      } else {
        warn(`Timer [${type}] does not exist.`, true)
      }
    }
    return null
  }

  addCode(key, code) {
    addCode(key, code)
  }

  // 调用数据上报的钩子
  // 网络请求等具体的副作用暴露给外部
  report(key, payload) {
    key = getCode(key)

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
  wraper(obj, name, fn) {
    assert(
        !(name in obj),
        'The method that needs to be wrapped is not a function',
    )
    obj[name] = createWraper(obj[name], fn)
  }

  // 插件
  use(plugin, ...args) {
    assert(
        this.installedPlugins.has(plugin),
        'Don\'t repeat install plugin',
    )

    this.installedPlugins.add(plugin)

    args.unshift(this)

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
      return plugins
    }
    return plugin.apply(null, args)
  }

  /**
   * 调用 setData 会调用此函数
   * 开发者手动调用也可以
   * @param component
   * @param data 用户自定义参数
   */
  update(component, fnName, params) {
    assert(isUndef(component), 'Missing component')
    const isPage = this.depComponents.get(component)
    const canProcessCfg = isPlainObject(component.SDKConfig)

    if (canProcessCfg) {
      handleConfigHooks.update(fnName, params, this, component.SDKConfig, component, isPage)
    }

    callHook(this.hooks, 'update', [this, component, isPage])
  }
}

// 上报状态码表
SDK._reportCodes = reportCodes

import Event from '../share/event'
import Router from '../modules/router'
import NetWork from '../modules/network'
import Template from '../modules/template'
import { WxPage, WxComponent } from './overidde-component'
import { warn, once, assert, isUndef, createWraper } from 'src/share/utils'

export interface Options {}
declare const __VERSION__: string

// 核心层只负责监听，简化逻辑，然后抛出事件，一个模块为一个事件队列
export default class Dusk extends Event {
  private options: Options
 
  public version = __VERSION__

  public Router = new Router()

  public NetWork = new NetWork()

  public Template = new Template()

  public types: Array<string> = []
 
  private timeStack = Object.create(null)
 
  public depComponents = new Map<WxPage | WxComponent, boolean>()

  public installedPlugins = new Set<(...args: Array<any>) => any>()

  public constructor (options: Options) {
    super()
    this.options = options
  }

  // 工具类
  public Utils = {
    once,
    createWraper,
  }

  public report (type:string, val: any) {
    assert(
      this.types.includes(type),
      `The [${type}] is not rigister.`,
    )

    this.emit('report', [type, val])
  }

  public addPlugin <T extends (dusk: Dusk, ...args: Array<any>) => any>(plugin: T, ...args) : ReturnType<T> {
    assert(
      !this.installedPlugins.has(plugin),
      'Don\'t repeat install plugin',
    )

    args.unshift(this)
    this.installedPlugins.add(plugin)
    return plugin.apply(null, args)
  }

  public time (type: string) {
    if (typeof type === 'string' && isUndef(this.timeStack[type])) {
      this.timeStack[type] = Date.now()
      return
    }

    warn(`Timer [${type}] already exists.`, true)
  }

  public timeEnd (type: string, fn?: (duration: number) => void) : number | null {
    if (typeof type === 'string') {
      const value = this.timeStack[type]
  
      if (!isUndef(value)) {
        const duration = Date.now() - value
        if (typeof fn === 'function') {
          fn(duration)
        }

        this.timeStack[type] = null
        return duration
      }
    }

    warn(`Timer [${type}] already exists.`)
    return null
  }
}
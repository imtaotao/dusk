import Event from '../share/event'
import { assert } from 'src/share/utils'
import { WxPage, WxComponent } from './overidde-component'

export interface Options {}
declare const __VERSION__: string
type ParamType<T> = T extends (param: infer P) => any ? P : T;
// 核心层只负责监听，简化逻辑，然后抛出事件，一个模块为一个事件队列
export default class Dusk extends Event {
  private options: Options
  public version = __VERSION__
  public types: Array<string> = []
  private timeStack = Object.create(null)
  public depComponents = new Map<WxPage | WxComponent, boolean>()
  public installedPlugins = new Set<(...args: Array<any>) => any>()

  public Router = {
    ...new Event()
  }

  public NetWork = {
    ...new Event()
  }

  public Template = {
    ...new Event()
  }

  public constructor (options: Options) {
    super()
    this.options = options
  }

  public report (type:string, val: any) {
    assert(
      this.types.includes(type),
      `The [${type}] is not rigister.`,
    )
    this.emit('report', [type, val])
  }

  public addPlugin<T extends (dusk: Dusk, ...args: Array<any>) => any>(plugin: T, ...args) : ReturnType<T> {
    assert(
      !this.installedPlugins.has(plugin),
      'Don\'t repeat install plugin',
    )

    args.unshift(this)
    this.installedPlugins.add(plugin)
    return plugin.apply(null, args)
  }
}
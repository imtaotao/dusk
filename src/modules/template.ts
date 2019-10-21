import Dusk from '../core/dusk'
import Event from '../share/event'
import { WxPage, WxComponent } from '../core/overidde-component'

interface Target {
  id: string
  offsetLeft: number
  offsetTop: number
  dataset: {
    [key: string]: any
  }
}

interface Touches {
  clientX: number
  clientY: number
  pageX: number
  pageY: number
  force: number
  identifier: number
}

interface WxEvent {
  type: string
  target: Target
  timeStamp: number
  currentTarget?: Target
  touches: Array<Touches>
  changedTouches: Array<Touches>
  mark?: {
    [key: string]: any
  }
  detail: {
    x: number
    y: number
  }
}

interface ExpandMethods {
  duskEvent (e: WxEvent) : void
  methods?: {
    duskEvent (e: WxEvent) : void
  }
}

export function expandExtrcMethods (dusk: Dusk, config: ExpandMethods & Object, isPage: boolean) {
  function duskEvent (e: WxEvent /* wx event */) {
    dusk.Template.acceptDuskEvent(this, e, isPage)
  }

  // duskEvent 是被占用的命名空间
  if (isPage) {
    config.duskEvent = duskEvent
  } else {
    if (config.methods) {
      config.methods.duskEvent = duskEvent
    } else {
      config.methods = { duskEvent }
    }
  }
}

export default class Template extends Event {
  public acceptDuskEvent (component: WxPage | WxComponent, e: WxEvent, isPage: boolean) {
    const type = e.type
    const value = e.target.dataset['dusk']

    if (value) {
      // 触发事件
      this.emit('event', [type, value, () => ({
        isPage,
        event: e,
        component,
      })])
    }
  }
}
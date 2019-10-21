import Dusk from '../core/dusk'
import Event from '../share/event'

interface ExpandMethods {
  duskEvent (e) : void
  methods?: {
    duskEvent (e) : void
  }
}

export function expandExtrcMethods (dusk: Dusk, config: ExpandMethods & Object, isPage: boolean) {
  function duskEvent (e: Object /* wx event */) {
    dusk.Template.emit('duskEvent', [e])
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

}
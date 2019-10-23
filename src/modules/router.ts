import Dusk from 'src/core/dusk'
import Event from '../share/event'

export interface RouterOptions {
  url?: string
  delta?: number
  events?: Object
  fail?: (error: Error) => void
  success?: (result: any) => void
  complete?: () => void
}

export default class Router extends Event {
  private dusk: Dusk

  public constructor (dusk: Dusk) {
    super()
    this.dusk = dusk
  }
}
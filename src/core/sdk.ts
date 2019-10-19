import Event from '../share/event'
import { Page, Component } from './overidde-component'
export interface Options {
  
}

export default class SDK extends Event {
  private options: Options
  public depComponents = new Map<Page | Component, boolean>()

  public constructor (options: Options) {
    super()
    this.options = options
  }

  public update () {

  }
}
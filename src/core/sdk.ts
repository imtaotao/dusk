import Event from '../share/event'

export interface Options {
  
}

export default class SDK extends Event {
  private options: Options

  constructor (options: Options) {
    super()
    this.options = options
  }
}
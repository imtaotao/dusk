export default class SDK {
  constructor (opts) {
    this.opts = opts
    this.depComponentData = new Map()
  }

  _addDep (component, isPage) {
    this.depComponentData.set(component, isPage)
  }
}
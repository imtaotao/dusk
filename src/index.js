class SDK {
  constructor (opts) {
    this.opts = opts
  }
}

export default function (opts) {
  return new SDK(opts)
}
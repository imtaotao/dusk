class SDK {
  constructor(opts) {
    this.opts = opts;
  }

}

function index (opts) {
  return new SDK(opts);
}

export default index;

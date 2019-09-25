'use strict';

class SDK {
  constructor(opts) {
    this.opts = opts;
  }

}

function index (opts) {
  return new SDK(opts);
}

module.exports = index;

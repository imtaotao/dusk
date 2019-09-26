class Router {
  constructor(sdk) {
    this.sdk = sdk;
  }

  report(name, payload) {
    payload.type = name;
    this.sdk.report('router', payload);
  }

  reportError(name, payload) {
    payload.type = name;
    this.sdk.report('routerError', payload);
  }

}

const warn = (message, isWarn) => {
  message = `\n[SDK warn]: ${message}\n\n`;

  if (isWarn) {
    console.warn(message);
    return;
  }

  throw new Error(message);
};
const assert = (condition, error) => {
  if (condition) {
    warn(error);
  }
};
const isUndef = v => {
  return v === null || v === undefined;
};
const callHook = (hooks, name, params) => {
  if (hooks && typeof hooks[name] === 'function') {
    return hooks[name].apply(hooks, params);
  }

  return null;
};
const createWraper = (target, fn) => {
  return function (...args) {
    fn.apply(this, args);

    if (typeof target === 'function') {
      return target.apply(this, args);
    }
  };
};
const isPlainObject = obj => {
  if (typeof obj !== 'object' || obj === null) return false;
  const proto = Object.getPrototypeOf(obj);
  if (proto === null) return true;
  let baseProto = proto;

  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto);
  }

  return proto === baseProto;
};

const reportCodes = {
  'router': 30,
  'showTime': 21,
  'startTime': 20,
  'routerError': 130,
  'catchGlobalError': 11
};
function code (key) {
  assert(!(key in reportCodes), `The ${key} is does not exist.`);
  return reportCodes[key];
}

class SDK {
  constructor(opts) {
    this.opts = opts;
    this.reportStack = {};
    this.hooks = opts.hooks;
    this.depComponents = new Map();
    this.router = new Router(this);
    this.installedPlugins = new Set();
    this.timeStack = Object.create(null);
  }

  time(type) {
    if (typeof type === 'string') {
      if (isUndef(this.timeStack[type])) {
        this.timeStack[type] = Date.now();
      } else {
        warn(`Timer [${type}] already exists.`, true);
      }
    }
  }

  timeEnd(type, fn) {
    if (typeof type === 'string') {
      if (!isUndef(this.timeStack[type])) {
        const duration = Date.now() - this.timeStack[type];
        typeof fn === 'function' && fn(duration);
        this.timeStack[type] = null;
        return duration;
      }
    } else {
      warn(`Timer [${type}] does not exist.`, true);
    }

    return null;
  }

  report(key, payload) {
    key = code(key);

    if (isUndef(this.reportStack[key])) {
      this.reportStack[key] = [payload];
      setTimeout(() => {
        callHook(this.hooks, 'report', [key, this.reportStack[key]]);
        this.reportStack[key] = null;
      }, 200);
    } else {
      this.reportStack[key].push(payload);
    }
  }

  wraper(obj, name, fn) {
    assert(!(name in obj), 'The method that needs to be wrapped is not a function');
    obj[name] = createWraper(obj[name], fn);
  }

  use(plugin, ...args) {
    if (this.installedPlugins.has(plugin)) {
      return;
    }

    args.unshift(this);

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }

    this.installedPlugins.add(plugin);
  }

}
SDK._reportCodes = reportCodes;

const getCurrentPagePath = () => {
  const pages = getCurrentPages();
  return Array.isArray(pages) && pages.length > 0 ? pages[pages.length - 1].route : null;
};

const handleRouter = (routerType, router, opts = {}) => {
  const {
    fail,
    success
  } = opts;
  const info = {
    to: opts.url,
    from: getCurrentPagePath()
  };
  opts.success = createWraper(success, () => router.report(routerType, info));
  opts.fail = createWraper(fail, error => {
    info.error = error;
    router.reportError(routerType, info);
  });
};

var overideWX = ((sdk, rewrite) => {
  rewrite('reLaunch', opts => handleRouter('reLaunch', sdk.router, opts));
  rewrite('switchTab', opts => handleRouter('switchTab', sdk.router, opts));
  rewrite('navigateTo', opts => handleRouter('navigateTo', sdk.router, opts));
  rewrite('redirectTo', opts => handleRouter('redirectTo', sdk.router, opts));
});

const SDKCfgNamespace = 'SDKConfig';
function overideComponent(sdk, config, isPage) {
  const SDKConfig = config[SDKCfgNamespace];
  const canProcessCfg = isPlainObject(SDKConfig);

  if (isPage) {
    const nativeLoad = config.onLoad;
    const nativeUnload = config.onUnload;
    config.onLoad = createWraper(nativeLoad, function () {
      sdk.depComponents.set(this, true);

      if (canProcessCfg) {
        this[SDKCfgNamespace] = SDKConfig;
      }
    });
    config.onUnload = createWraper(nativeUnload, function () {
      sdk.depComponents.delete(this);

      if (canProcessCfg) {
        this[SDKCfgNamespace] = null;
      }
    });
  } else {
    config.lifetimes = config.lifetimes || {};
    const nativeAttached = config.attached || config.lifetimes.attached;
    const nativeDetached = config.detached || config.lifetimes.detached;
    config.attached = config.lifetimes.attached = createWraper(nativeAttached, function () {
      sdk.depComponents.set(this, false);

      if (canProcessCfg) {
        this[SDKCfgNamespace] = SDKConfig;
      }
    });
    config.detached = config.lifetimes.detached = createWraper(nativeDetached, function () {
      sdk.depComponents.delete(this);

      if (canProcessCfg) {
        this[SDKCfgNamespace] = null;
      }
    });
  }

  return config;
}
function overideApp(sdk, config) {
  const nativeShow = config.onShow;
  const nativeHide = config.onHide;
  const nativeError = config.onError;
  config.onShow = createWraper(nativeShow, function () {
    sdk.time('showTime');
    const duration = sdk.timeEnd('startTime');
    sdk.report('startTime', duration);
  });
  config.onHide = createWraper(nativeHide, function () {
    const duration = sdk.timeEnd('showTime');
    sdk.report('showTime', duration);
  });
  config.onError = createWraper(nativeError, function (errMsg) {
    sdk.report('globalCatchError', errMsg);
  });
  return config;
}
function overideWxClass(sdk, nativeWX) {
  const overideClass = {};
  overideWX(sdk, (name, fn) => {
    assert(!(name in nativeWX), 'Only allowed to rewrite.');
    assert(name in overideClass, `${name} has been rewritten`);
    overideClass[name] = createWraper(nativeWX[name], fn);
  });
  wx = Object.assign({}, nativeWX, overideClass);
}

let isInitComplete = false;
const nativeWX = wx;
const nativeApp = App;
const nativePage = Page;
const nativeComponent = Component;

const filterOpts = opts => {
  return Object.assign({
    hooks: {
      report() {
        warn('you need defined [report] hook function.');
      }

    }
  }, opts);
};

function index (opts) {
  if (isInitComplete) {
    warn('Can\'t allow repeat initialize.');
  }

  const sdk = new SDK(filterOpts(opts || {}));
  sdk.time('startTime');

  Page = function (config) {
    config = overideComponent(sdk, config, true);
    return nativePage.call(this, config);
  };

  Component = function (config) {
    config = overideComponent(sdk, config, false);
    return nativeComponent.call(this, config);
  };

  App = function (config) {
    config = overideApp(sdk, config);
    return nativeApp.call(this, config);
  };

  overideWxClass(sdk, nativeWX);
  isInitComplete = true;
  return sdk;
}

export default index;
//# sourceMappingURL=wxsdk.esm.js.map

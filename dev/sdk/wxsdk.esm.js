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
const isFn = f => {
  return typeof f === 'function';
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

var handleConfigHooks = {
  app: {},
  page: {
    onLoad(sdk, page, opts, SDKConfig) {
      const onLoadFns = SDKConfig.onLoad;

      for (const key in onLoadFns) {
        if (onLoadFns.hasOwnProperty(key) && typeof onLoadFns[key] === 'function') {
          onLoadFns[key](sdk, page);
        }
      }
    },

    onShow(sdk, page, opts, SDKConfig) {
      const onShowFns = SDKConfig.onShow;

      for (const key in onShowFns) {
        if (onShowFns.hasOwnProperty(key) && typeof onShowFns[key] === 'function') {
          onShowFns[key](sdk, page);
        }
      }
    },

    onUnLoad(sdk, page, opts, SDKConfig) {}

  },
  component: {},

  update(fnName, params, sdk, SDKConfig, component, isPage) {
    if (typeof SDKConfig.update !== 'object') return;
    params = isUndef(params) ? {} : params;

    if (isUndef(fnName)) {
      for (const key in SDKConfig.update) {
        if (SDKConfig.update.hasOwnProperty(key)) {
          SDKConfig.update[key](params);
        }
      }

      return;
    }

    assert(!isFn(SDKConfig.update[fnName]), `Can't find function: ${fnName}`);
    SDKConfig.update[fnName](params);
  }

};

const reportCodes = {
  'catchGlobalError': 11,
  'routerError': 130,
  'router': 30
};
const addCode = (key, code) => {
  assert(key in reportCodes, `The [${key}] already exists.`);
  reportCodes[key] = code;
};
const getCode = key => {
  assert(!(key in reportCodes), `Code [${key}] is does not exist.`);
  return reportCodes[key];
};

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
      } else {
        warn(`Timer [${type}] does not exist.`, true);
      }
    }

    return null;
  }

  addCode(key, code) {
    addCode(key, code);
  }

  report(key, payload) {
    key = getCode(key);

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
    assert(this.installedPlugins.has(plugin), 'Don\'t repeat install plugin');
    this.installedPlugins.add(plugin);
    args.unshift(this);

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
      return plugins;
    }

    return plugin.apply(null, args);
  }

  update(component, fnName, params) {
    assert(isUndef(component), 'Missing component');
    const isPage = this.depComponents.get(component);
    const canProcessCfg = isPlainObject(component.SDKConfig);

    if (canProcessCfg) {
      handleConfigHooks.update(fnName, params, this, component.SDKConfig, component, isPage);
    }

    callHook(this.hooks, 'update', [this, component, isPage]);
  }

}
SDK._reportCodes = reportCodes;

function firstScrenTime (sdk, homePath) {
  assert(isUndef(homePath), '[firstScreenTime] plugin need a home page path.');
  const hooks = sdk.hooks;
  if (isUndef(hooks.app)) hooks.app = {};
  if (isUndef(hooks.page)) hooks.page = {};
  sdk.addCode('startTime', 20);
  sdk.addCode('showTime', 21);
  sdk.addCode('renderContentTime', 22);
  sdk.addCode('renderAllContentTime', 23);
  hooks.app.onShow = createWraper(hooks.app.onShow, function () {
    if (!isUndef(homePath)) {
      sdk.time('renderContentTime');
    }

    sdk.time('renderAllContentTime');
    sdk.time('showTime');
    const duration = sdk.timeEnd('startTime');
    sdk.report('startTime', duration);
  });
  hooks.app.onHide = createWraper(hooks.app.onHide, function () {
    const duration = sdk.timeEnd('showTime');
    sdk.report('showTime', duration);
  });
  hooks.app.onError = createWraper(hooks.app.onError, function (errMsg) {
    sdk.report('catchGlobalError', errMsg);
  });

  if (!isUndef(homePath)) {
    hooks.page.onReady = createWraper(hooks.app.onReady, function (sdk, page) {
      if (homePath === page.route) {
        const duration = sdk.timeEnd('renderContentTime');
        sdk.report('renderContentTime', duration);
      }
    });
  }

  return () => {
    const duration = sdk.timeEnd('renderAllContentTime');
    sdk.report('renderAllContentTime', duration);
  };
}



var index = /*#__PURE__*/Object.freeze({
  firstScrenTime: firstScrenTime
});

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
const pageLifeTime = 'onLoad,onShow,onReady,onHide,onUnload';
const componentLifeTime = 'created,attached,ready,moved,detached';
const appLifeTime = 'onLaunch,onShow,onHide,onError,onPageNotFound';
function overideComponent(sdk, config, isPage) {
  const SDKConfig = config[SDKCfgNamespace];
  const canProcessCfg = isPlainObject(SDKConfig);

  const dispatch = (name, component, opts) => {
    let compHooks, configHooks;

    if (isPage) {
      compHooks = sdk.hooks.page;
      configHooks = handleConfigHooks.page;
    } else {
      compHooks = sdk.hooks.component;
      configHooks = handleConfigHooks.component;
    }

    if (name === 'onLoad' || name === 'attached') {
      sdk.depComponents.set(component, isPage);
      const setData = component.setData;

      component.setData = function (data, callback) {
        setData.call(this, data, createWraper(callback, () => {
          sdk.update(this);
        }));
      };
    }

    if (name === 'onUnload' || name === 'detached') {
      sdk.depComponents.delete(component);
    }

    if (canProcessCfg) {
      component[SDKCfgNamespace] = SDKConfig;
      callHook(configHooks, 'onLoad', [sdk, component, opts, SDKConfig, isPage]);
    }

    callHook(compHooks, name, [sdk, component, opts]);
  };

  if (isPage) {
    pageLifeTime.split(',').forEach(name => {
      config[name] = createWraper(config[name], function (opts) {
        dispatch(name, this, opts);
      });
    });
  } else {
    config.lifetimes = config.lifetimes || {};

    const get = key => config[key] || config.lifetimes[key];

    const set = (key, fn) => config[key] = config.lifetimes[key] = fn;

    componentLifeTime.split(',').forEach(name => {
      set(name, createWraper(get(name), function (opts) {
        dispatch(name, this, opts);
      }));
    });
  }

  return config;
}
function overideApp(sdk, config) {
  const SDKConfig = config[SDKCfgNamespace];
  const canProcessCfg = isPlainObject(SDKConfig);
  appLifeTime.split(',').forEach(name => {
    config[name] = createWraper(config[name], function (opts) {
      if (canProcessCfg) {
        this[SDKCfgNamespace] = SDKConfig;
        callHook(handleConfigHooks.app, name, [sdk, this, opts, SDKConfig, isPage]);
      }

      callHook(sdk.hooks.app, name, [sdk, this, opts]);
    });
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

function initSDK(opts) {
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

export default initSDK;
export { index as plugins };
//# sourceMappingURL=wxsdk.esm.js.map

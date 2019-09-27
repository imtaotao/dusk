'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
const once = fn => {
  let called = false;
  return function () {
    if (!called) {
      called = true;
      return fn.apply(this, arguments);
    }
  };
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

  getCurrentPage() {
    const pages = getCurrentPages();
    return Array.isArray(pages) && pages.length > 0 ? pages[pages.length - 1] : null;
  }

}

var handleConfigHooks = {
  app: {},
  page: {
    onLoad(sdk, page, opts, SDKConfig) {},

    onUnLoad(sdk, page, opts, SDKConfig) {}

  },
  component: {},

  update(component, SDKConfig, isPage) {}

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
    this.reportCodes = reportCodes;
    this.installedPlugins = new Set();
    this.timeStack = Object.create(null);
  }

  once(fn) {
    return once(fn);
  }

  wraper(target, fn) {
    return createWraper(target, fn);
  }

  addCode(key, code) {
    addCode(key, code);
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

  addPlugin(plugin, ...args) {
    assert(this.installedPlugins.has(plugin), 'Don\'t repeat install plugin');
    args.unshift(this);

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }

    this.installedPlugins.add(plugin);
  }

  update(component) {
    assert(isUndef(component), 'Missing component');
    const isPage = this.depComponents.get(component);
    const canProcessCfg = isPlainObject(component.SDKConfig);

    if (canProcessCfg) {
      handleConfigHooks.update(this, component, component.SDKConfig, isPage);
    }

    callHook(this.hooks, 'update', [this, component, isPage]);
  }

}

function autoReport (sdk, opts = {}) {
  assert(typeof opts.url !== 'string', 'The request url must be a string.\n\n --- from [autoReport] plugin\n');
  assert(!('projectName' in opts), 'Must defined [projectName] field.');
  const allowMethods = ['GET', 'POST'];

  const genData = bm => {
    const uid = typeof opts.uid === 'function' ? opts.uid() : '';
    return {
      bm,
      uid,
      tp: 0,
      sp: 'stat',
      sc: opts.projectName,
      t: Date.parse(new Date()),
      unid: 'za-ad10c-16d630b0690',
      p: sdk.router.getCurrentPage().route
    };
  };

  function wraperReprot(key, val) {
    let data = [];
    let method = 'GET';

    switch (key) {
      case 11:
        break;

      case 130:
        break;

      case 21:
        break;

      case 20:
        data = val.map(initToRequestTime => ({ ...genData('time'),
          exd: {
            initToRequestTime
          }
        }));
        break;

      case 22:
        data = val.map(renderContentTime => ({ ...genData('time'),
          exd: {
            renderContentTime
          }
        }));
        break;

      case 23:
        data = val.map(renderAllContentTime => ({ ...genData('time'),
          exd: {
            renderAllContentTime
          }
        }));
        break;

      case 30:
        break;

      default:
        if (typeof opts.callback === 'function') {
          const {
            data: _d,
            method: _m,
            module: _bm
          } = opts.callback(key, val);
          assert(!Array.isArray(data), '[data] must be an Array\n\n --- from [autoReport] plugin\n');
          assert(typeof _bm !== 'string', '[module] must be an String\n\n --- from [autoReport] plugin\n');
          method = _m;
          data = _d.map(exd => ({ ...genData(_bm),
            exd
          }));
        }

    }

    if (allowMethods.includes(method) && data.length > 0) {
      data.forEach(item => {
        wx.request({
          method,
          data: item,
          url: opts.url,
          header: opts.header || {}
        });
      });
    }
  }

  if (isUndef(sdk.hooks.report) || typeof sdk.hooks.report === 'function' && sdk.hooks.report.name !== 'defaultReport') {
    sdk.hooks.report = createWraper(sdk.hooks.report, wraperReprot);
  } else {
    sdk.hooks.report = wraperReprot;
  }
}

function firstScreenTime (sdk) {
  let entryPath = null;
  const hooks = sdk.hooks;
  if (isUndef(hooks.app)) hooks.app = {};
  if (isUndef(hooks.page)) hooks.page = {};
  sdk.addCode('initToRequestTime', 20);
  sdk.addCode('showTime', 21);
  sdk.addCode('renderContentTime', 22);
  sdk.addCode('renderAllContentTime', 23);
  hooks.app.onLaunch = createWraper(hooks.app.onLaunch, (sdk, app, opts) => {
    entryPath = opts.path;
    sdk.time('initToRequestTime');
  });
  hooks.app.onShow = createWraper(hooks.app.onShow, () => {
    if (!isUndef(entryPath)) {
      sdk.time('renderContentTime');
    }

    sdk.time('renderAllContentTime');
    sdk.time('showTime');
  });
  hooks.app.onHide = createWraper(hooks.app.onHide, () => {
    const duration = sdk.timeEnd('showTime');
    sdk.report('showTime', duration);
  });
  hooks.app.onError = createWraper(hooks.app.onError, errMsg => {
    sdk.report('catchGlobalError', errMsg);
  });

  if (!isUndef(entryPath)) {
    hooks.page.onReady = createWraper(hooks.app.onReady, (sdk, page) => {
      if (entryPath === page.route) {
        const duration = sdk.timeEnd('renderContentTime');
        sdk.report('renderContentTime', duration);
      }
    });
  }

  sdk.firstScreen = {
    initToRequest: once(() => {
      const duration = sdk.timeEnd('initToRequestTime');
      sdk.report('initToRequestTime', duration);
    }),
    renderAllTime: once(() => {
      const duration = sdk.timeEnd('renderAllContentTime');
      sdk.report('renderAllContentTime', duration);
    })
  };
}



var index = /*#__PURE__*/Object.freeze({
  autoReport: autoReport,
  firstScreenTime: firstScreenTime
});

const handleRouter = (routerType, router, opts = {}) => {
  const {
    fail,
    success
  } = opts;
  const info = {
    to: opts.url,
    from: router.getCurrentPage().route
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
      component.SDK = sdk;
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
      report: function defaultReport() {
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

exports.default = initSDK;
exports.plugins = index;

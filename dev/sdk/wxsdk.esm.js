const warn$1 = (message, isWarn) => {
  message = `\n[ReportSDK warn]: ${message}\n\n`;

  if (isWarn) {
    console.warn(message);
    console.log(121);
    return;
  }

  throw new Error(message);
};
const assert = (condition, error) => {
  if (condition) {
    warn$1(error);
  }
};
const isUndef = v => {
  return v === null || v === undefined;
};
const callHook = (hooks, name, params) => {
  if (hooks && typeof hooks[name] === 'function') {
    return [true, hooks[name].apply(hooks, params)];
  }

  return [false, null];
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

class SDK {
  constructor(opts) {
    this.opts = opts;
    this.hooks = opts.hooks;
    this.depComponents = new Map();
    this.timeStack = Object.create(null);
  }

  time(type) {
    if (typeof type === 'string') {
      if (isUndef(this.timeStack[type])) {
        this.timeStack[type] = Date.now();
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
    }

    return null;
  }

  report(key, payload) {
    const [success, res] = callHook(this.hooks, 'report', [key, payload]);
    assert(!success, 'The [report] hooks is not defined.');
    return res;
  }

}

var overideWX = ((sdk, rewrite) => {
  rewrite('navigateTo', function () {});
});

const SDKCfgNamespace = 'SDKConfig';
function overideComponent(sdk, config, isPage) {
  const SDKConfig = config[SDKCfgNamespace];
  const canProcessCfg = isPlainObject(SDKConfig);

  if (isPage) {
    const nativeLoad = config.onLoad;
    const nativeUnload = config.onUnload;
    config.onLoad = createWraper(nativeLoad, function () {
      sdk.depComponentData.set(this, true);

      if (canProcessCfg) {
        this[SDKCfgNamespace] = SDKConfig;
      }
    });
    config.onUnload = createWraper(nativeUnload, function () {
      sdk.depComponentData.delete(this);

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
  const nativeLaunch = config.onLaunch;
  config.onLaunch = createWraper(nativeLaunch, function () {
    const duration = sdk.timeEnd('startTime');
    sdk.report('startTime', duration);
  });
  config.onShow = createWraper(nativeShow, function () {
    sdk.time('showTime');
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
  return opts;
};

function index (opts) {
  if (isInitComplete) {
    warn('Can\'t allow repeat initialize.');
  }

  const sdk = new SDK(filterOpts(opts));
  sdk.time('startTime');

  Page = function (config) {
    config = overideComponent(sdk, config, true);
    return nativePage.call(this, config);
  };

  Component = function (config) {
    config = overideComponent(this, sdk, config);
    return nativeComponent.call(this, config);
  };

  App = function (config) {
    config = overideApp(this, sdk);
    return nativeApp.call(this, config);
  };

  overideWxClass(sdk, nativeWX);
  isInitComplete = true;
  return sdk;
}

export default index;
//# sourceMappingURL=wxsdk.esm.js.map

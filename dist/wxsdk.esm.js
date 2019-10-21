var warn = function (message, isWarn) {
    message = "\n[SDK warn]: " + message + "\n\n";
    if (isWarn) {
        console.warn(message);
        return;
    }
    throw new Error(message);
};
var assert = function (condition, error) {
    if (!condition)
        warn(error);
};
var mapObject = function (obj, callback) {
    var result = {};
    for (var key in obj) {
        result[key] = callback(key, obj[key]);
    }
    return result;
};
var createWraper = function (target, before, after) {
    function wrap() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result;
        if (typeof before === 'function') {
            before.apply(this, args);
        }
        if (typeof target === 'function') {
            result = target.apply(this, args);
        }
        if (typeof after === 'function') {
            after.apply(this, args);
        }
        return result;
    }
    return wrap;
};

var pageLifeTime = 'onLoad,onShow,onReady,onHide,onUnload';
var componentLifeTime = 'created,attached,ready,moved,detached';
var appLifeTime = 'onLaunch,onShow,onHide,onError,onPageNotFound';
function injectToComponent(component, modules) {
    mapObject(modules, function (key, val) {
        component[key] = val;
    });
}
function dispatch(name, dusk, component, isPage, opts) {
    if (name === 'onLoad' || name === 'attached') {
        injectToComponent(component, { dusk: dusk });
        dusk.depComponents.set(component, isPage);
        var setData_1 = component.setData;
        component.setData = function (data, callback) {
            setData_1.call(this, data, createWraper(callback, function () {
                dusk.emit('setData', [data]);
            }));
        };
    }
    if (name === 'onUnload' || name === 'detached') {
        dusk.depComponents.delete(component);
    }
    dusk.emit(name, [component, opts, isPage]);
}
function overideApp(dusk, config) {
    appLifeTime.split(',')
        .forEach(function (name) {
        config[name] = createWraper(config[name], function (opts) {
            dusk.emit(name, [this, opts]);
        });
    });
    return config;
}
function overidePage(dusk, config) {
    pageLifeTime.split(',')
        .forEach(function (name) {
        config[name] = createWraper(config[name], function (opts) {
            dispatch(name, dusk, this, true, opts);
        });
    });
    return config;
}
function overideComponent(dusk, config) {
    config.lifetimes = config.lifetimes || {};
    var get = function (key) { return config[key] || config.lifetimes[key]; };
    var set = function (key, fn) { return config[key] = config.lifetimes[key] = fn; };
    componentLifeTime.split(',')
        .forEach(function (name) {
        set(name, createWraper(get(name), function (opts) {
            dispatch(name, dusk, this, false, opts);
        }));
    });
    return config;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};
function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function getEventModule(instance, type) {
    return instance._listener[type] || (instance._listener[type] = {
        once: [],
        normal: [],
    });
}
var Event = (function () {
    function Event() {
        this._listener = Object.create(null);
    }
    Event.prototype.on = function (type, fn) {
        if (typeof type !== 'string' &&
            typeof fn !== 'function') {
            return false;
        }
        getEventModule(this, type).normal.push(fn);
        return true;
    };
    Event.prototype.once = function (type, fn) {
        if (typeof type !== 'string' &&
            typeof fn !== 'function') {
            return false;
        }
        getEventModule(this, type).once.push(fn);
        return true;
    };
    Event.prototype.off = function (type, fn) {
        var eventModule = this._listener[type];
        if (eventModule) {
            if (typeof fn === 'function') {
                var index = -1;
                var once = eventModule.once, normal = eventModule.normal;
                if (~(index = once.indexOf(fn))) {
                    once.splice(index, 1);
                }
                if (~(index = normal.indexOf(fn))) {
                    once.splice(index, 1);
                }
            }
            else if (fn === undefined) {
                eventModule.once = [];
                eventModule.normal = [];
            }
            return true;
        }
        return false;
    };
    Event.prototype.offAll = function () {
        this._listener = Object.create(null);
    };
    Event.prototype.emit = function (type, data) {
        var _this = this;
        if (data === void 0) { data = []; }
        var eventModule = this._listener[type];
        if (eventModule) {
            eventModule.once.forEach(function (fn) { return fn.apply(_this, data); });
            eventModule.once = [];
            eventModule.normal.forEach(function (fn) { return fn.apply(_this, data); });
            return true;
        }
        return false;
    };
    return Event;
}());

var Dusk = (function (_super) {
    __extends(Dusk, _super);
    function Dusk(options) {
        var _this = _super.call(this) || this;
        _this.version = '0.0.1';
        _this.types = [];
        _this.timeStack = Object.create(null);
        _this.depComponents = new Map();
        _this.installedPlugins = new Set();
        _this.Router = __assign({}, new Event());
        _this.NetWork = __assign({}, new Event());
        _this.Template = __assign({}, new Event());
        _this.options = options;
        return _this;
    }
    Dusk.prototype.report = function (type, val) {
        assert(this.types.includes(type), "The [" + type + "] is not rigister.");
        this.emit('report', [type, val]);
    };
    Dusk.prototype.addPlugin = function (plugin) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        assert(!this.installedPlugins.has(plugin), 'Don\'t repeat install plugin');
        args.unshift(this);
        this.installedPlugins.add(plugin);
        return plugin.apply(null, args);
    };
    return Dusk;
}(Event));

var nativeWX = wx;

var nativeApp = App;
var nativePage = Page;
var nativeComponent = Component;
var isInitComplete = false;
function createDuskInstance(options) {
    assert(!isInitComplete, 'Can\'t allow repeat initialize.');
    isInitComplete = true;
    var sdk = new Dusk(options);
    Page = function (config) {
        config = overidePage(sdk, config);
        return nativePage.call(this, config);
    };
    Component = function (config) {
        config = overideComponent(sdk, config);
        return nativeComponent.call(this, config);
    };
    App = function (config) {
        config = overideApp(sdk, config);
        return nativeApp.call(this, config);
    };
    return sdk;
}

export { createDuskInstance };
//# sourceMappingURL=wxsdk.esm.js.map

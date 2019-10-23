'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var warning = function (message, iswarning) {
    message = "\n[SDK warning]: " + message + "\n\n";
    if (iswarning) {
        console.warn(message);
        return;
    }
    throw new Error(message);
};
var assert = function (condition, error) {
    if (!condition)
        warning(error);
};
var isUndef = function (v) {
    return v === null || v === undefined;
};
var once = function (fn) {
    var first = true;
    function wrap() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!first)
            return;
        first = false;
        return fn.apply(this, args);
    }
    return wrap;
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

function autoSendRequest(dusk, filterData) {
    assert(typeof filterData === 'function', "The [filterData] must be a function, but now is a [" + typeof filterData + "].");
    dusk.on('report', function (type, value) {
        var data = null;
        var genReportData = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            assert(args.length === 4, 'The parameter is invalid');
            return data = (_a = dusk.NetWork).baseReportData.apply(_a, args);
        };
        filterData(type, value, genReportData);
        if (!isUndef(data)) {
            dusk.NetWork.report(dusk.options.url, data, 'GET');
        }
    });
}

function getLegalTimeType(dusk) {
    var timeType = dusk.Utils.randomId();
    return dusk.timeStack[timeType]
        ? getLegalTimeType(dusk)
        : timeType;
}
function recordRequestTime(dusk, filterData) {
    assert(typeof filterData === 'function', "The [filterData] must be a function, but now is a [" + typeof filterData + "].");
    dusk.NetWork.on('request', function (options) {
        if (options.record) {
            var timeType_1 = getLegalTimeType(dusk);
            dusk.time(timeType_1);
            options.complete = dusk.Utils.createWraper(options.complete, function () {
                var data = dusk.NetWork.baseReportData(5, 'stat', 'requestTime', {
                    url: options.url,
                    duration: dusk.timeEnd(timeType_1),
                });
                filterData([
                    data,
                    function (endData) {
                        assert(typeof endData === 'object', 'the report data must be an object');
                        return dusk.NetWork.report(dusk.options.url, endData, 'GET');
                    },
                ]);
            });
        }
    });
}

function listenerButton(dusk, filterData) {
    assert(typeof filterData === 'function', "The [filterData] must be a function, but now is a [" + typeof filterData + "].");
    dusk.Template.on('event', function (type, value, detail) {
        var data = dusk.NetWork.baseReportData(0, 'stat', 'clickButton', { type: type, value: value });
        filterData([
            data,
            function (endData) {
                assert(typeof endData === 'object', 'the report data must be an object');
                return dusk.NetWork.report(dusk.options.url, endData, 'GET');
            },
            detail,
        ]);
    });
}



var index = /*#__PURE__*/Object.freeze({
  autoSendRequest: autoSendRequest,
  recordRequestTime: recordRequestTime,
  listenerButton: listenerButton
});

var pageLifeTime = 'onLoad,onShow,onReady,onHide,onUnload';
var componentLifeTime = 'created,attached,ready,moved,detached';
var appLifeTime = 'onLaunch,onShow,onHide,onError,onPageNotFound';
function injectToComponent(component, modules) {
    mapObject(modules, function (key, val) {
        component[key] = val;
    });
}
function dispatch(name, dusk, component, isPage, options, config) {
    if (name === 'onLoad' || name === 'attached') {
        dusk.depComponents.set(component, isPage);
        injectToComponent(component, { dusk: dusk });
        var setData_1 = component.setData;
        component.setData = function (data, callback) {
            setData_1.call(this, data, createWraper(callback, function () {
                dusk.emit('setData', [component, data, config, isPage]);
            }));
        };
    }
    if (name === 'onUnload' || name === 'detached') {
        dusk.depComponents.delete(component);
    }
    dusk.emit(name, [component, options, config, isPage]);
}
function overideApp(dusk, config) {
    appLifeTime.split(',')
        .forEach(function (name) {
        config[name] = createWraper(config[name], function (options) {
            dusk.emit(name, [this, options, config]);
        });
    });
    return config;
}
function overidePage(dusk, config) {
    pageLifeTime.split(',')
        .forEach(function (name) {
        config[name] = createWraper(config[name], function (options) {
            dispatch(name, dusk, this, true, options, config);
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
        set(name, createWraper(get(name), function (options) {
            dispatch(name, dusk, this, false, options, config);
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

var Utils = {
    once: once,
    createWraper: createWraper,
    uuid: function () {
        var uuidFormat = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        return uuidFormat.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    unid: function () {
        var ramdomNum = parseInt(Math.random().toString().slice(-6)).toString(16);
        var oxtimestamp = parseInt(Date.now()).toString(16);
        return "za-" + ramdomNum + "-" + oxtimestamp;
    },
    randomId: function (max, min, fraction) {
        if (max === void 0) { max = 1000000; }
        if (min === void 0) { min = 0; }
        if (fraction === void 0) { fraction = 0; }
        return Number(Math.random() * (max - min) + min).toFixed(fraction);
    },
    getCurrentPage: function () {
        var pages = getCurrentPages();
        return Array.isArray(pages) && pages.length > 0
            ? pages[pages.length - 1]
            : null;
    },
};

var Router = (function (_super) {
    __extends(Router, _super);
    function Router(dusk) {
        var _this = _super.call(this) || this;
        _this.dusk = dusk;
        return _this;
    }
    return Router;
}(Event));

var NetWork = (function (_super) {
    __extends(NetWork, _super);
    function NetWork(dusk) {
        var _this = _super.call(this) || this;
        _this.dusk = dusk;
        return _this;
    }
    NetWork.prototype.baseReportData = function (tp, sp, moduleTag, expandData) {
        return {
            tp: tp,
            sp: sp,
            t: Date.now(),
            bm: moduleTag,
            exd: expandData || {},
            unid: this.dusk.Utils.unid(),
            p: (this.dusk.Utils.getCurrentPage() || { route: '' }).route,
        };
    };
    NetWork.prototype.report = function (url, data, method, header) {
        if (header === void 0) { header = {}; }
        return new Promise(function (resolve) {
            wx.request({ url: url, data: data, method: method, header: header, complete: resolve });
        });
    };
    return NetWork;
}(Event));

function expandExtrcMethods(dusk, config, isPage) {
    function duskEvent(e) {
        dusk.Template.acceptDuskEvent(this, e, isPage);
    }
    if (isPage) {
        config.duskEvent = duskEvent;
    }
    else {
        if (config.methods) {
            config.methods.duskEvent = duskEvent;
        }
        else {
            config.methods = { duskEvent: duskEvent };
        }
    }
}
var DATANAMESPACE = 'dusk';
function getResult(event) {
    var mark = event.mark;
    var dataset = event.target.dataset;
    return (mark && mark[DATANAMESPACE]) || dataset[DATANAMESPACE];
}
var Template = (function (_super) {
    __extends(Template, _super);
    function Template() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Template.prototype.acceptDuskEvent = function (component, e, isPage) {
        var type = e.type;
        var value = getResult(e);
        if (value) {
            this.emit('event', [type, value, function () { return ({
                    isPage: isPage,
                    event: e,
                    component: component,
                }); }]);
        }
    };
    return Template;
}(Event));

function filterOptions(options) {
    assert(typeof options.url === 'string', 'The report url must be a string');
    return options;
}
var Dusk = (function (_super) {
    __extends(Dusk, _super);
    function Dusk(options) {
        var _this = _super.call(this) || this;
        _this.version = '0.0.1';
        _this.Utils = Utils;
        _this.Template = new Template();
        _this.Router = new Router(_this);
        _this.NetWork = new NetWork(_this);
        _this.types = [];
        _this.timeStack = Object.create(null);
        _this.depComponents = new Map();
        _this.installedPlugins = new Set();
        _this.options = filterOptions(options || {});
        return _this;
    }
    Dusk.prototype.addType = function (type) {
        if (!this.types.includes(type)) {
            this.types.push(type);
        }
    };
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
    Dusk.prototype.time = function (type) {
        if (typeof type === 'string' && isUndef(this.timeStack[type])) {
            this.timeStack[type] = Date.now();
            return;
        }
        warning("Timer [" + type + "] already exists.", true);
    };
    Dusk.prototype.timeEnd = function (type, fn) {
        if (typeof type === 'string') {
            var value = this.timeStack[type];
            if (!isUndef(value)) {
                var duration = Date.now() - value;
                if (typeof fn === 'function') {
                    fn(duration);
                }
                this.timeStack[type] = null;
                return duration;
            }
        }
        warning("Timer [" + type + "] already exists.");
        return null;
    };
    return Dusk;
}(Event));

var nativeWX = wx;
function overiddenWX(dusk, rewrite) {
    var routerMethods = 'reLaunch,switchTab,navigateTo,redirectTo,navigateBack';
    routerMethods.split(',').forEach(function (method) {
        rewrite(method, function (options) {
            dusk.Router.emit(method, [options]);
        });
    });
    var netWorkMethods = 'request';
    netWorkMethods.split(',').forEach(function (method) {
        rewrite(method, function (options) {
            dusk.NetWork.emit(method, [options]);
        });
    });
}
function overiddenWX$1 (dusk) {
    var overrideClass = {
        __wraperFns__: []
    };
    overiddenWX(dusk, function (method, fn) {
        assert(method in nativeWX, 'Can\'t allowed add new method.');
        assert(!(method in overrideClass), "[" + method + "] has been rewritten");
        overrideClass.__wraperFns__.push(method);
        overrideClass[method] = createWraper(nativeWX[method], fn);
    });
    wx = Object.assign({}, nativeWX, overrideClass);
}

var nativeApp = App;
var nativePage = Page;
var nativeComponent = Component;
var isInitComplete = false;
function createDuskInstance(options) {
    assert(!isInitComplete, 'Can\'t allow repeat initialize.');
    isInitComplete = true;
    var dusk = new Dusk(options);
    Page = function (config) {
        config = overidePage(dusk, config);
        dusk.emit('pageCreateBefore', [config]);
        expandExtrcMethods(dusk, config, true);
        return nativePage.call(this, config);
    };
    Component = function (config) {
        config = overideComponent(dusk, config);
        dusk.emit('ComponentCreateBefore', [config]);
        expandExtrcMethods(dusk, config, false);
        return nativeComponent.call(this, config);
    };
    App = function (config) {
        config = overideApp(dusk, config);
        dusk.emit('appCreateBefore', [config]);
        expandExtrcMethods(dusk, config, true);
        return nativeApp.call(this, config);
    };
    overiddenWX$1(dusk);
    return dusk;
}

exports.createDuskInstance = createDuskInstance;
exports.plugins = index;

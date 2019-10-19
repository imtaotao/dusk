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

var SDK = (function (_super) {
    __extends(SDK, _super);
    function SDK(options) {
        var _this = _super.call(this) || this;
        _this.depComponents = new Map();
        _this.options = options;
        return _this;
    }
    SDK.prototype.update = function () {
    };
    return SDK;
}(Event));

var nativeWX = wx;
var nativeApp = App;
var nativePage = Page;
var nativeComponent = Component;

import overideWX from './wx'
import {onLoad, onShow, unLoad} from '../handle-config'
import {createWraper, isPlainObject, assert, callHook} from '../utils'

export const SDKCfgNamespace = 'SDKConfig'

/**
 * 数据统计的具体实现思路
 *  1. 需要对各种时长进行统计
 *  2. 对页面点击的埋点统计
 *  3. 自定业务逻辑的埋点统计
 *  4. 向外暴露的 api
 */

// 重写 component 和 page 的 config
export function overideComponent(sdk, config, isPage) {
    const SDKConfig = config[SDKCfgNamespace]
    const canProcessCfg = isPlainObject(SDKConfig)

    // Page
    if (isPage) {
        const nativeLoad = config.onLoad
        const nativeOnShow = config.onShow
        const nativeUnload = config.onUnload

        // rewritte load hooks
        config.onLoad = createWraper(
            nativeLoad,
            function () {
                sdk.depComponents.set(this, true)
                if (canProcessCfg) {
                    this[SDKCfgNamespace] = SDKConfig
                    onLoad(sdk, this, SDKConfig, true)
                }
            },
        )

        config.onShow = createWraper(
            nativeOnShow,
            function () {
                if (canProcessCfg) {
                    this[SDKCfgNamespace] = SDKConfig
                    onShow(sdk, this, SDKConfig, true)
                }
            }
        )

        // rewritte unload hook
        config.onUnload = createWraper(
            nativeUnload,
            function () {
                sdk.depComponents.delete(this)
                if (canProcessCfg) {
                    unLoad(sdk, this, SDKConfig, true)
                    this[SDKCfgNamespace] = null
                }
            },
        )
    } else {
        // Component
        config.lifetimes = config.lifetimes || {}
        const nativeAttached = config.attached || config.lifetimes.attached
        const nativeDetached = config.detached || config.lifetimes.detached

        config.attached = config.lifetimes.attached = createWraper(
            nativeAttached,
            function () {
                sdk.depComponents.set(this, false)
                if (canProcessCfg) {
                    this[SDKCfgNamespace] = SDKConfig
                    load(sdk, this, SDKConfig, true)
                }
            },
        )

        config.detached = config.lifetimes.detached = createWraper(
            nativeDetached,
            function () {
                sdk.depComponents.delete(this)
                if (canProcessCfg) {
                    unLoad(sdk, this, SDKConfig, true)
                    this[SDKCfgNamespace] = null
                }
            },
        )
    }
    return config
}

// 重写 app 的 config
export function overideApp(sdk, config) {
    const nativeShow = config.onShow
    const nativeHide = config.onHide
    const nativeError = config.onError

    config.onShow = createWraper(
        nativeShow,
        function () {
            // 记录当前 app 从显示到隐藏，一共停留的时长
            sdk.time('showTime')
            // 记录初始化的时长
            const duration = sdk.timeEnd('startTime')
            sdk.report('startTime', duration)

        },
    )

    config.onHide = createWraper(
        nativeHide,
        function () {
            const duration = sdk.timeEnd('showTime')
            sdk.report('showTime', duration)
        },
    )

    config.onError = createWraper(
        nativeError,
        function (errMsg) {
            // 自动上报在 app 里面捕获到的错误
            sdk.report('globalCatchError', errMsg)
            callHook(sdk.hooks, 'ddd', [1, 2, 3])
        },
    )

    return config
}

// 重写 wx 类
export function overideWxClass(sdk, nativeWX) {
    const overideClass = {}

    overideWX(sdk, (name, fn) => {
        // 只允许重写，不允许新增
        // 如果需要新增全局方法，不应该写在这里
        assert(!(name in nativeWX), 'Only allowed to rewrite.')
        assert(name in overideClass, `${name} has been rewritten`)
        overideClass[name] = createWraper(nativeWX[name], fn)
    })

    wx = Object.assign({}, nativeWX, overideClass)
}

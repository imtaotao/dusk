import overideWX from './wx'
import handleConfigHooks from '../handle-config'
import { createWraper, isPlainObject, assert, callHook } from '../utils'

export const SDKCfgNamespace = 'SDKConfig'

// 需要包裹的生命周期
const pageLifeTime = 'onLoad,onShow,onReady,onHide,onUnload'
const componentLifeTime = 'created,attached,ready,moved,detached'
const appLifeTime = 'onLaunch,onShow,onHide,onError,onPageNotFound'

// 重写 component 和 page 的 config
export function overideComponent (sdk, config, isPage) {
  const SDKConfig = config[SDKCfgNamespace]
  const canProcessCfg = isPlainObject(SDKConfig)

  const dispatch = (name, component, opts) => {
    let compHooks, configHooks

    // 得到钩子对象
    if (isPage) {
      compHooks = sdk.hooks.page
      configHooks = handleConfigHooks.page
    } else {
      compHooks = sdk.hooks.component
      configHooks = handleConfigHooks.component
    }

    if (name === 'onLoad' || name === 'attached') {
      // 添加依赖
      sdk.depComponents.set(component, isPage)
    }
    if (name === 'onUnload' || name === 'detached') {
      sdk.depComponents.delete(component)
    }

    // 如果当前组件有关于 sdk 的配置就需要处理
    if (canProcessCfg) {
      component[SDKCfgNamespace] = SDKConfig
      callHook(configHooks, 'onLoad', [sdk, component, opts, SDKConfig, isPage])
    }
    callHook(compHooks, name, [sdk, component, opts])
  }

  // 包装所有生命周期函数
  // 然后调用 hooks，具体的实现内容可以通过插件的形式处理
  if (isPage) {
    pageLifeTime.split(',').forEach(name => {
      config[name] = createWraper(
        name,
        function (opts) {
          dispatch(name, this, opts)
        },
      )
    })
  } else {
    // Component
    config.lifetimes = config.lifetimes || {}
    const get = key => config[key] || config.lifetimes[key]
    const set = (key, fn) => config[key] = config.lifetimes[key] = fn 

    componentLifeTime.split(',').forEach(name => {
      set(name,
        createWraper(
          get(name),
          function (opts) {
            dispatch(name, this, opts)
          },
        )  
      )
    })
  }
  return config
}

// 重写 app 的 config
export function overideApp (sdk, config) {
  const SDKConfig = config[SDKCfgNamespace]
  const canProcessCfg = isPlainObject(SDKConfig)

  appLifeTime.split(',').forEach(name => {
    config[name] = createWraper(
      config[name],
      function (opts) {
        if (canProcessCfg) {
          this[SDKCfgNamespace] = SDKConfig
          callHook(handleConfigHooks.app, name, [sdk, this, opts, SDKConfig, isPage])
        }
        callHook(sdk.hooks.app, name, [sdk, this, opts])
      },
    )
  })

  return config
}

// 重写 wx 类
export function overideWxClass (sdk, nativeWX) {
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
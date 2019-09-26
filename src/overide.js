import { load, onLoad } from './handle-config'
import { createWraper, isPlainObject } from './utils'

export const SDKCfgNamespace = 'SDKConfig'

/**
 * 数据统计的具体实现思路
 *  1. 需要对各种时长进行统计
 *  2. 对页面点击的埋点统计
 *  3. 自定业务逻辑的埋点统计
 *  4. 向外暴露的 api
 */
export function overideComponent (sdk, config, isPage) {
  const SDKConfig = config[SDKCfgNamespace]
  const canProcessCfg = isPlainObject(SDKConfig)

  // Page
  if (isPage) {
    const nativeLoad = config.onLoad
    const nativeUnload = config.onUnload

    // rewritte load hooks
    config.onLoad = createWraper(
      nativeLoad,
      function () {
        sdk.depComponentData.set(this, true)
        if (canProcessCfg) {
          load(sdk, this, SDKConfig, true)
        }
      },
    )

    // rewritte unload hook
    config.onUnload = createWraper(
      nativeUnload,
      function () {
        sdk.depComponentData.delete(this)
        if (canProcessCfg) {
          onLoad(sdk, this, SDKConfig, true)
        }
      },
    )
  } else {
    // Component
    config.lifetimes = config.lifetimes || {}
    const nativeAttached = config.attached || config.lifetimes.attached
    const nativeDetached = config.detached || config.lifetimes.detached

    config.attached =
    config.lifetimes.attached = createWraper(
      nativeAttached,
      function () {
        sdk.depComponentData.set(this, false)
        if (canProcessCfg) {
          load(sdk, this, SDKConfig, true)
        }
      },
    )

    config.detached =
    config.lifetimes.detached = createWraper(
      nativeDetached,
      function () {
        sdk.depComponentData.delete(this)
        if (canProcessCfg) {
          onLoad(sdk, this, SDKConfig, true)
        }
      },
    )
  }
  return config
}

export function overideApp (sdk, config) {
  return config
}
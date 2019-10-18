// 用来处理 sdkconfig 配置
import { assert, isUndef, isPlainObject } from "../utils";

export default {
  app: {},

  page: {
    onLoad(sdk, page, opts, SDKConfig) {
      // SDKConfig.onLoad.report1.fn.call(sdk, component)
      const onLoadFns = SDKConfig.onLoad
      for (const key in onLoadFns) {
        if (onLoadFns.hasOwnProperty(key) && typeof onLoadFns[key] === 'function') {
          onLoadFns[key](sdk, page)
        }
      }
    },

    onShow(sdk, page, opts, SDKConfig) {
      const onShowFns = SDKConfig.onShow
      for (const key in onShowFns) {
        if (onShowFns.hasOwnProperty(key) && typeof onShowFns[key] === 'function') {
          onShowFns[key](sdk, page)
        }
      }
    },

    onUnLoad(sdk, page, opts, SDKConfig) {

    },
  },

  component: {},

  // 不传方法名则执行所有方法
  // 未处理setData之后的update
  update({fnName, params, sdk, SDKConfig, component, isPage, isSetData}) {
    params = isUndef(params) ? {} : params
    // setData之后的自动更新
    if (isSetData) {
      if (!isPlainObject(SDKConfig.updateAfterSetData)) return
      for (const key in SDKConfig.updateAfterSetData) {
        if (SDKConfig.updateAfterSetData.hasOwnProperty(key)) {
          SDKConfig.updateAfterSetData[key]()
        }
      }
      return
    }

    // 手动调用的更新
    if (!isPlainObject(SDKConfig.update)) return
  
    // 执行所有update的方法
    if (isUndef(fnName)) {
      for (const key in SDKConfig.update) {
        if (SDKConfig.update.hasOwnProperty(key)) {
          SDKConfig.update[key](params)
        }
      }
      return
    }

    assert(
      typeof SDKConfig.update[fnName] === 'function',
      `Can't find function: ${fnName}`,
    )

    // 执行具体的update fn
    SDKConfig.update[fnName](params)
  }
}

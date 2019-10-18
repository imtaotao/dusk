import SDK from './core'
import {warn} from './utils'
import * as plugins from './plugins'
import {overideApp, overideComponent, overideWxClass} from './overide'

let isInitComplete = false

const nativeWX = wx
const nativeApp = App
const nativePage = Page
const nativeComponent = Component

const filterOpts = opts => {
  return Object.assign(
      {
        hooks: {
          // defaultReport 这个函数名是需要的，在一些插件里面可能需要因此判断是不是默认的函数
          report: function defaultReport() {
            warn('you need defined [report] hook function.', true)
          },
        },
      },
      opts,
  )
}

function initSDK(opts) {
  if (isInitComplete) {
    warn('Can\'t allow repeat initialize.')
  }

  const sdk = new SDK(filterOpts(opts || {}))

  Page = function (config) {
    config = overideComponent(sdk, config, true)
    return nativePage.call(this, config)
  }
  Component = function (config) {
    config = overideComponent(sdk, config, false)
    return nativeComponent.call(this, config)
  }
  App = function (config) {
    config = overideApp(sdk, config)
    return nativeApp.call(this, config)
  }
  // 重写 wx 原生类
  overideWxClass(sdk, nativeWX)

  isInitComplete = true
  return sdk
}

export {
  plugins,
  initSDK as default,
}

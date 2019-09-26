import SDK from './core'
import { overideApp, overideComponent, overideWxClass } from './overide'

let isInitComplete = false

const nativeWX = wx
const nativeApp = App
const nativePage = Page
const nativeComponent = component

const filterOpts = opts => {
  return opts
}

export default function (opts) {
  if (isInitComplete) {
    warn('Can\'t allow repeat initialize.')
  }

  const sdk = new SDK(filterOpts(opts))

  // 记录项目启动时的时机点
  sdk.time('startTime')

  Page = function (config) {
    config = overideComponent(sdk, config, true)
    return nativePage.call(this, config)
  }
  Component = function (config) {
    config = overideComponent(this, sdk, config, false)
    return nativeComponent.call(this, config)
  }
  App = function (config) {
    config = overideApp(this, sdk, config)
    return nativeApp.call(this, config)
  }
  // 重写 wx 原生类
  overideWxClass(sdk, nativeWX)

  isInitComplete = true
  return sdk
}
import SDK from './core'
import { overideApp, overideComponent } from './overide'

let isInitComplete = false

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

  Page = function (config) {
    config = overideComponent(sdk, config, true)
    return nativePage.call(this, config)
  }

  Commponent = function (config) {
    config = overideComponent(this, sdk, config, false)
    return nativeComponent.call(this, config)
  }

  App = function (config) {
    config = overideApp(this, sdk, config)
    return nativeApp.call(this, config)
  }

  isInitComplete = true
  return sdk
}
import {
  overideApp,
  overidePage,
  overideComponent,
} from './overidde-component'
import {
  warn,
  assert,
} from '../share/utils'
import SDK, { Options } from './sdk'
import overiddenWX from './overidden-wx'

declare let wx: Object
declare let App: Function
declare let Page: Function
declare let Component: Function

const nativeWX = wx
const nativeApp = App
const nativePage = Page
const nativeComponent = Component

let isInitComplete = false

export default function createSDK (options: Options) {
  assert(
    !isInitComplete,
    'Can\'t allow repeat initialize.',
  )
  isInitComplete = true

  const sdk = new SDK(options)

  Page = function (config: Object) {
    config = overidePage(sdk, config)
    return nativePage.call(this, config)
  }

  Component = function (config: Object) {
    config = overideComponent(sdk, config as any)
    return nativeComponent.call(this, config)
  }

  App = function (config: Object) {
    config = overideApp(sdk, config)
    return nativeApp.call(this, config)
  }

  return sdk
}
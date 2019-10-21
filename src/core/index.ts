import {
  overideApp,
  overidePage,
  overideComponent,
} from './overidde-component'
import Dusk, { Options } from './dusk'
import { assert } from '../share/utils'
import overiddenWX from './overidden-wx'

declare let App: Function
declare let Page: Function
declare let Component: Function

const nativeApp = App
const nativePage = Page
const nativeComponent = Component

let isInitComplete = false

export default function createDuskInstance (options: Options) {
  assert(
    !isInitComplete,
    'Can\'t allow repeat initialize.',
  )
  isInitComplete = true

  const sdk = new Dusk(options)

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

  // 包装 wx 相关的类
  overiddenWX(sdk)

  return sdk
}
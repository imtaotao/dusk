import {
  overideApp,
  overidePage,
  overideComponent,
} from './overidde-component'
import Dusk, { Options } from './dusk'
import { assert } from '../share/utils'
import overiddenWX from './overidden-wx'
import { expandExtrcMethods } from '../modules/template'

declare let App: Function
declare let Page: Function
declare let Component: Function

let isInitComplete = false

export default function createDusk (
  nativeApp: Function,
  nativePage: Function,
  nativeComponent: Function,
  options: Options,
) {
  assert(
    !isInitComplete,
    'Can\'t allow repeat initialize.',
  )

  assert(
    typeof nativeApp === 'function',
    'the [App] must be a function'
  )

  assert(
    typeof nativePage === 'function',
    'the [Page] must be a function'
  )

  assert(
    typeof nativeComponent === 'function',
    'the [Component] must be a function'
  )

  isInitComplete = true

  const dusk = new Dusk(options)

  Page = function (config: Object) {
    config = overidePage(dusk, config)
    dusk.emit('pageCreateBefore', [config])
    expandExtrcMethods(dusk, config as any, true)

    return nativePage.call(this, config)
  }

  Component = function (config: Object) {
    config = overideComponent(dusk, config as any)
    dusk.emit('ComponentCreateBefore', [config])
    expandExtrcMethods(dusk, config as any, false)

    return nativeComponent.call(this, config)
  }

  App = function (config: Object) {
    config = overideApp(dusk, config)
    dusk.emit('appCreateBefore', [config])
    expandExtrcMethods(dusk, config as any, true)

    return nativeApp.call(this, config)
  }

  // 包装 wx 相关的类
  overiddenWX(dusk)

  return dusk
}
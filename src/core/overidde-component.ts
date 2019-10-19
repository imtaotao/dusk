import SDK from './sdk'
import { createWraper, isPlainObject } from '../share/utils'

export interface Page {
  SDK: SDK
  setData: (data: Object, callback?: Function) => void
}

export interface Component {
  SDK: SDK
  setData: (data: Object, callback?: Function) => void
}

// 需要包裹的生命周期
type AppLife = 'onLaunch'
  | 'onShow'
  | 'onHide'
  | 'onError'
  | 'onPageNotFound'

type PageLife = 'onLoad'
  | 'onShow'
  | 'onReady'
  | 'onHide'
  | 'onUnload'

type ComponentLife = 'created'
  | 'attached'
  | 'ready'
  | 'moved'
  | 'detached'

const pageLifeTime = 'onLoad,onShow,onReady,onHide,onUnload'
const componentLifeTime = 'created,attached,ready,moved,detached'
const appLifeTime = 'onLaunch,onShow,onHide,onError,onPageNotFound'

function dispatch (
  name: PageLife| ComponentLife,
  sdk: SDK,
  component: Page | Component,
  isPage: boolean,
  opts?: Object,
) {
    if (name === 'onLoad' || name === 'attached') {
      // 将 SDK 注入到组件中
      component.SDK = sdk
      // 添加依赖
      sdk.depComponents.set(component, isPage)

      // 包装 setState 方法，组件的每次更新我们都需要知道
      const setData = component.setData
      component.setData = function (data, callback) {
        setData.call(this, data,
          createWraper(callback as any, () => {
            sdk.emit('setData', [data])
            sdk.update()
          })
        )
      }
    }

    if (name === 'onUnload' || name === 'detached') {
      sdk.depComponents.delete(component)
    }

    sdk.emit(name, [component, opts, isPage])
}

export function overideApp (
  sdk: SDK,
  config: Object
) {
  appLifeTime.split(',')
  .forEach((name: AppLife) => {
    config[name] = createWraper(
        config[name],
        function (opts?: Object) {
          sdk.emit(name, [this, opts])
        },
    )
  })
  return config
}

export function overidePage (
  sdk: SDK,
  config: Object
) {
  pageLifeTime.split(',')
  .forEach((name: PageLife) => {
    config[name] = createWraper(
        config[name],
        function (opts?: Object) {
          dispatch(name, sdk, this, true, opts)
        },
    )
  })
  return config
}

export function overideComponent (
  sdk: SDK,
  config: { lifetimes: Object }
) {
  config.lifetimes = config.lifetimes || {}
  const get = (key: string) => config[key] || config.lifetimes[key]
  const set = (key: string, fn: Function) => config[key] = config.lifetimes[key] = fn

  componentLifeTime.split(',')
  .forEach((name: ComponentLife) => {
    set(name,
      createWraper(
        get(name),
        function (opts?: Object) {
          dispatch(name, sdk, this, false, opts)
        },
      )
    )
  })
  return config
}
import Dusk from './dusk'
import { mapObject, createWraper } from '../share/utils'

export interface WxPage {
  dusk: Dusk
  route: string
  setData: (data: Object, callback?: Function) => void
}

export interface WxComponent {
  dusk: Dusk
  setData: (data: Object, callback?: Function) => void
}

// 需要包裹的生命周期
// 这些什么周期都会触发对应的事件，将不再通过 hooks 的方式触发
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

function injectToComponent <T>(
  component: (WxPage | WxComponent) & T,
  modules: T
) {
  mapObject(modules, (key, val) => {
    component[key] = val
  })
}

function dispatch (
  name: PageLife | ComponentLife,
  dusk: Dusk,
  component: WxPage | WxComponent,
  isPage: boolean,
  options: Object,
  config: Object,
) {
    if (name === 'onLoad' || name === 'attached') {
      // 添加依赖
      dusk.depComponents.set(component, isPage)

      // 将需要的依赖注入到组件中去
      injectToComponent(component, { dusk })

      // 包装 setState 方法，组件的每次更新我们都需要知道
      const setData = component.setData
      component.setData = function (data, callback) {
        setData.call(this, data,
          createWraper(callback as any, () => {
            dusk.emit('setData', [data])
          })
        )
      }
    }

    // 组件销毁的时候移除依赖
    if (name === 'onUnload' || name === 'detached') {
      dusk.depComponents.delete(component)
    }

    dusk.emit(name, [component, options, config, isPage])
}

export function overideApp (
  dusk: Dusk,
  config: Object
) {
  appLifeTime.split(',')
  .forEach((name: AppLife) => {
    config[name] = createWraper(
        config[name],
        function (options: Object) {
          dusk.emit(name, [this, options, config])
        },
    )
  })
  return config
}

export function overidePage (
  dusk: Dusk,
  config: Object
) {
  pageLifeTime.split(',')
  .forEach((name: PageLife) => {
    config[name] = createWraper(
        config[name],
        function (options: Object) {
          dispatch(name, dusk, this, true, options, config)
        },
    )
  })
  return config
}

export function overideComponent (
  dusk: Dusk,
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
        function (options: Object) {
          dispatch(name, dusk, this, false, options, config)
        },
      )
    )
  })
  return config
}
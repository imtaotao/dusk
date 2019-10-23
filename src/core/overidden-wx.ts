import Dusk from './dusk'
import { RouterOptions } from '../modules/router'
import { RequestOptions } from '../modules/network'
import { assert, createWraper } from '../share/utils'

declare let wx: {
  [key: string]: (...args: Array<any>) => any
}

type RouterMethods =
    'reLaunch'
  | 'switchTab'
  | 'navigateTo'
  | 'redirectTo'
  | 'navigateBack'

type RequestMethods =
    'request'

interface OverrideClass {
  __wraperFns__: Array<string>
}

const nativeWX = wx

function overiddenWX (dusk: Dusk, rewrite: (string, Function) => void) {
  // 导航相关方法
  const routerMethods = 'reLaunch,switchTab,navigateTo,redirectTo,navigateBack'
  routerMethods.split(',').forEach((method: RouterMethods) => {
    rewrite(
      method,
      (options: RouterOptions) => {
        dusk.Router.emit(method, [options])
      },
    )
  })

  // 网络请求相关方法
  const netWorkMethods = 'request'
  netWorkMethods.split(',').forEach((method: RequestMethods) => {
    rewrite(
      method,
      (options: RequestOptions) => {
        dusk.NetWork.emit(method, [options])
      },
    )
  })
}

export default function (dusk: Dusk) {
  const overrideClass: OverrideClass = {
    // 这个属性记录着更改过的方法
    __wraperFns__: []
  }

  overiddenWX(
    dusk,
    (method: string, fn: (...args: Array<any>) => any) => {
      // 只允许重写，不允许新增
      // 如果需要新增全局方法，不应该写在这里
      assert(
        method in nativeWX,
        'Can\'t allowed add new method.',
      )
      assert(
        !(method in overrideClass),
        `[${method}] has been rewritten`,
      )

      overrideClass.__wraperFns__.push(method)
      overrideClass[method] = createWraper(nativeWX[method], fn)
    },
  )

  wx = Object.assign({}, nativeWX, overrideClass)
}
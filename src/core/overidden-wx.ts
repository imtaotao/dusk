import Dusk from './dusk'
import { RouterOptions } from '../modules/router'
import { RequestOptions } from '../modules/network'
import { assert, createWraper } from '../share/utils'

declare let wx: {
  [key: string]: (...args: Array<any>) => any
}

interface OverrideClass {
  __wraperFns__: Array<string>
}

const nativeWX = wx

function overiddenWX (dusk: Dusk, rewrite: (string, Function) => void) {
  // 导航相关方法
  const routerMethods = 'reLaunch,switchTab,navigateTo,redirectTo,navigateBack'
  routerMethods.split(',').forEach(methodName => {
    rewrite(
      methodName,
      (options: RouterOptions) => {
        dusk.Router.emit(methodName, [options])
      },
    )
  })

  // 网络请求相关方法
  const netWorkMethods = 'request'
  netWorkMethods.split(',').forEach(methodName => {
    rewrite(
      methodName,
      (options: RequestOptions) => {
        dusk.NetWork.emit(methodName, [options])
      },
    )
  })
}

export default function (dusk: Dusk) {
  const overrideClass: OverrideClass = {
    __wraperFns__: []
  }

  overiddenWX(
    dusk,
    (
      name: string,
      fn: (...args: Array<any>) => any
    ) => {
      // 只允许重写，不允许新增
      // 如果需要新增全局方法，不应该写在这里
      assert(
        name in nativeWX,
        'Can\'t allowed add new method.',
      )
      assert(
        !(name in overrideClass),
        `[${name}] has been rewritten`,
      )

      overrideClass.__wraperFns__.push(name)
      overrideClass[name] = createWraper(nativeWX[name], fn)
    },
  )

  wx = Object.assign({}, nativeWX, overrideClass)
}
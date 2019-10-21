import Dusk from './dusk'
import { assert, createWraper } from '../share/utils'

declare let wx: Object
const nativeWX = wx

function overiddenWX (dusk: Dusk, rewrite: (string, Function) => void) {
  // 导航相关方法
  const routerMethos = 'reLaunch,switchTab,navigateTo,redirectTo'
  routerMethos.split(',').forEach(methodName => {
    rewrite(methodName, options => {
      dusk.Router.emit(methodName, [options])
    })
  })
}

export default function (dusk: Dusk) {
  const overideClass = {}

  overiddenWX(dusk, (name, fn) => {
    // 只允许重写，不允许新增
    // 如果需要新增全局方法，不应该写在这里
    assert(
      name in nativeWX,
      'Can\'t allowed add new method.',
    )
    assert(
      !(name in overideClass),
      `[${name}] has been rewritten`,
    )
    overideClass[name] = createWraper(nativeWX[name], fn)
  })

  wx = Object.assign({}, nativeWX, overideClass)
}
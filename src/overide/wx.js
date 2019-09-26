import { createWraper } from '../utils'

// 获取当前页面
const getCurrentPagePath = () => {
  const pages = getCurrentPages()
  return Array.isArray(pages) && pages.length > 0
    ? pages[pages.length - 1].route
    : null
}

const handleRouter = (routerType, sdk, opts = {}) => {
  const { fail, success } = opts
  const info = {
    routerType,
    to: opts.url,
    from: getCurrentPagePath(),
  }

  // 路由跳转成功
  opts.success = createWraper(
    success,
    () => sdk.report('router', info),
  )

  // 路由跳转发生错误
  opts.fail = createWraper(
    fail,
    error => {
      info.error = error
      sdk.report('routerError', info)
    },
  )
}

export default (sdk, rewrite) => {
  // 导航相关方法
  rewrite('reLaunch', opts => handleRouter('reLaunch', sdk, opts))
  rewrite('switchTab', opts => handleRouter('switchTab', sdk, opts))
  rewrite('navigateTo', opts => handleRouter('navigateTo', sdk, opts))
  rewrite('redirectTo', opts => handleRouter('redirectTo', sdk, opts))
}
import { createWraper } from '../utils'

// 获取当前页面
const getCurrentPagePath = () => {
  const pages = getCurrentPages()
  return Array.isArray(pages) && pages.length > 0
    ? pages[pages.length - 1].route
    : null
}

const handleRouter = (routerType, router, opts = {}) => {
  const { fail, success } = opts
  const info = {
    to: opts.url,
    from: getCurrentPagePath(),
  }

  // 路由跳转成功
  opts.success = createWraper(
    success,
    () => router.report(routerType, info),
  )

  // 路由跳转发生错误
  opts.fail = createWraper(
    fail,
    error => {
      info.error = error
      router.reportError(routerType, info)
    },
  )
}

export default (sdk, rewrite) => {
  // 导航相关方法
  rewrite('reLaunch', opts => handleRouter('reLaunch', sdk.router, opts))
  rewrite('switchTab', opts => handleRouter('switchTab', sdk.router, opts))
  rewrite('navigateTo', opts => handleRouter('navigateTo', sdk.router, opts))
  rewrite('redirectTo', opts => handleRouter('redirectTo', sdk.router, opts))
}
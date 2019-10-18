// 处理路由跳转相关数据
export default class Router {
  constructor(sdk) {
    this.sdk = sdk
  }

  report(name, payload) {
    payload.type = name
    this.sdk.report('router', payload)
  }

  reportError(name, payload) {
    payload.type = name
    this.sdk.report('routerError', payload)
  }

  // 获取当前页面
  getCurrentPage() {
    const pages = getCurrentPages()
    return Array.isArray(pages) && pages.length > 0
        ? pages[pages.length - 1]
        : null
  }
}

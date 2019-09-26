// 处理路由跳转相关数据
export default class Router {
  constructor (sdk) {
    this.sdk = sdk
  }

  report (name, payload) {
    payload.type = name
    this.sdk.report('router', payload)
  }

  reportError (name, payload) {
    payload.type = name
    this.sdk.report('routerError', payload)
  }
}
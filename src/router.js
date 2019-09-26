// 处理路由跳转相关数据
export default class Router {
  constructor (sdk) {
    this.sdk = sdk
  }

  report (name, payload) {
    payload.type = name
    this.sdk.report('report', payload)
  }

  reportError (name, payload) {
    payload.type = name
    this.sdk.report('reportError', payload)
  }
}
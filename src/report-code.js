import { assert } from './utils'

// 错误类为 1x
// 时间类为 2x
// 路由类为 3x
// 优先级从上到下
export const reportCodes = {
  'router': 30, // 路由跳转成功
  'showTime': 21, // 小程序从 show 到 hide 的时长
  'startTime': 20, // 小程序启动的时长
  'routerError': 130, // 路由发送错误的时长
  'catchGlobalError': 11, // app 里面捕获到的全局错误
}

export default function (key) {
  assert(!(key in reportCodes), `The ${key} is does not exist.`)
  return reportCodes[key]
}
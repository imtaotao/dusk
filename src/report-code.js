import { assert } from './utils'

// 错误类为 1x
// 时间类为 2x
// 路由类为 3x
// 事件类为 4x
// 优先级从上到下
export const reportCodes = {
  'catchGlobalError': 11, // app 里面捕获到的全局错误
  'routerError': 130, // 路由发送错误的时长
  'router': 30, // 路由跳转成功
}

export const addCode = (key, code) => {
  assert(!(key in reportCodes), `The [${key}] already exists.`)
  reportCodes[key] = code
}

export const getCode = key => {
  assert(key in reportCodes, `Code [${key}] is does not exist.`)
  return reportCodes[key]
}

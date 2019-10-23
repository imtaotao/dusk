// 监听每个请求的时长
import Dusk from '../core/dusk'
import { RequestOptions } from '../modules/network'

// 得到一个唯一的 type
function getLegalTimeType (dusk: Dusk) : string {
  const timeType = dusk.Utils.randomId()
  return dusk.timeStack[timeType]
    ? getLegalTimeType(dusk)
    : timeType
}

export function recordRequestTime (dusk: Dusk) {
  dusk.NetWork.on('request', (options: RequestOptions) => {
    // 过滤掉不需要记录的请求
    if (options.record) {
      // 记录时间
      const timeType = getLegalTimeType(dusk)
      dusk.time(timeType)

      options.complete = dusk.Utils.createWraper(
        options.complete,
        () => {
          const duration = dusk.timeEnd(timeType)
          console.log(options.url, duration)
        }
      )
    }
  })
}
// 监听每个请求的时长
import Dusk from '../core/dusk'
import { assert } from '../share/utils'
import { ReportNextResult } from './index'
import { RequestOptions } from '../modules/network'

// 得到一个唯一的 type
function getLegalTimeType (dusk: Dusk) : string {
  const timeType = dusk.Utils.randomId()
  return dusk.timeStack[timeType]
    ? getLegalTimeType(dusk)
    : timeType
}

export function recordRequestTime (
  dusk: Dusk,
  filterData: (...args: ReportNextResult) => void
) {
  assert(
    typeof filterData === 'function',
    `The [filterData] must be a function, but now is a [${typeof filterData}]. \n\n from recordRequestTime plugin`
  )

  dusk.NetWork.on('request', (options: RequestOptions) => {
    // 过滤掉不需要记录的请求
    if (options.record) {
      // 记录时间
      const timeType = getLegalTimeType(dusk)
      dusk.time(timeType)

      options.complete = dusk.Utils.createWraper(
        options.complete,
        () => {
          const data = dusk.NetWork.baseReportData(
            5,
            'stat',
            'requestTime',
            {
              url: options.url,
              duration: dusk.timeEnd(timeType),
            },
          )

          filterData(data, destData => {
            assert(
              typeof destData === 'object',
              'the report data must be an object'
            )
            return dusk.NetWork.report(dusk.options.url, destData, 'GET')
          })
        }
      )
    }
  })
}
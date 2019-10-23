import Dusk from 'src/core/dusk'
import { assert, isUndef } from '../share/utils'
import { baseReportData } from '../modules/network'

/**
 * Usage
 *  dusk.addPlugin(autoSendRequest, (type, val, gen) => {
 *    // 最后一个 exd 参数是可选的
 *    const data = gen(0, 'log', 'click', { memberId: 'xxx' })
 *    data.uid = xx
 *  })
*/

type AcceptData = [
  baseReportData['tp'],
  baseReportData['sp'],
  string,
  baseReportData['exd'],
]

type FilterData = (
  type: string,
  value: any,
  gen: (...args: AcceptData) => baseReportData
) => void

// 自动上报，简化上报流程
export function autoSendRequest (dusk: Dusk, filterData: FilterData) {
  assert(
    typeof filterData === 'function',
    `The [filterData] must be a function, but now is a [${typeof filterData}]. \n\n from autoRequest plugin`
  )

  // 监听 report
  dusk.on('report', (type: string, value: any) => {
    let data: baseReportData = null as any
    const genReportData = (...args: AcceptData) => {
      assert(
        args.length === 4,
        'The parameter is invalid',
      )
      return data = dusk.NetWork.baseReportData(...args)  
    }

    // 最终的数据生成还是要交给业务层，因为无法预料业务层需要添加和修正的数据
    filterData(type, value, genReportData)

    if (!isUndef(data)) {
      dusk.NetWork.report(dusk.options.url, data, 'GET')
    }
  })
}
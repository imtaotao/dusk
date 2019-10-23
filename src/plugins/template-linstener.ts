// 监听模板上报
import Dusk from '../core/dusk'
import { assert } from '../share/utils'
import { ReportNextResult } from './index'
import { WxEvent } from '../modules/template'
import { WxPage, WxComponent } from '../core/overidde-component'

interface DetailResult {
  isPage: boolean
  event: WxEvent
  component: WxPage | WxComponent
}

export function listenerButton (dusk: Dusk) {
  dusk.Template.on('event', (
    type: string,
    value: any,
    detail: () => DetailResult
  ) => {
    const data = dusk.NetWork.baseReportData(0, 'stat', 'clickButton', { type, value })

    // 所有的具体上报都要走一遍业务逻辑，这样可以添加自定义的数据和修正数据
    // 第一个参数默认为 data
    // 第二个参数为 next 函数
    // 第三个参数可有可无，为其他数据
    dusk.Template.emit('report',
      [
        data,
        endData => {
          assert(
            typeof endData === 'object',
            'the report data must be an object'
          )

          return dusk.NetWork.report(dusk.options.url, endData, 'GET')
        },
        detail,
      ] as ReportNextResult,
    )
  })
}
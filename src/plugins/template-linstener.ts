// 监听模板上报
import Dusk from '../core/dusk'
import { assert } from '../share/utils'
import { WxEvent } from '../modules/template'
import { WxPage, WxComponent } from '../core/overidde-component'

interface Options {
  sendData (data: Object, detail: () => DetailResult) : Object
}

interface DetailResult {
  isPage: boolean
  event: WxEvent
  component: WxPage | WxComponent
}

export function listenerButton (dusk: Dusk, options: Options) {
  assert(!!options, 'The [options] must be an object')

  assert(
    typeof options.sendData === 'function',
    'You must defined [sendData] function',
  )

  dusk.Template.on('event', (
    type: string,
    value: any,
    detail: () => DetailResult
  ) => {
    const data = options.sendData(
      {
        tp: 0,
        sp: 'stat',
        t: Date.now(),
        bm: 'clickButton',
        exd: { type, value },
        unid: dusk.Utils.unid(),
        p: (dusk.Utils.getCurrentPage() || { route: '' }).route,
      },
      detail,
    )

    assert(
      typeof data === 'object',
      'the report data must be an object'
    )

    dusk.Utils.report(dusk.options.url, data, 'GET')
  })
}
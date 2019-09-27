import { assert, isUndef, createWraper } from '../utils'

// 自动上报的插件
export default function (sdk, opts) {
  const { url, header = {} } = opts || {}
  const allowMethods = ['GET', 'POST']

  assert(
    typeof url !== 'string',
    'The request url must be a string.\n\n --- from [autoReport] plugin\n',
  )

  // 这些是固定需要上报的数据
  const genData = bm => {
    const uid = typeof opts.uid === 'function' ? opts.uid() : ''
    return {
      bm,
      uid,
      tp: 0,
      sc: 'mp',
      sp: 'stat',
      t: Date.parse(new Date()),
      unid: 'za-ad10c-16d630b0690',
      p: sdk.router.getCurrentPage().route,
    }
  }

  // 只处理默认的类型，其他用于自己定义的通过回调来得到数据
  function wraperReprot (key, val) {
    let data = []
    let method = 'GET'
    
    switch (key) {
      // catchGlobalError
      case 11 :
        break

      // routerError
      case 130 :
        break

      // showTime
      case 21 :
        break

      // initToRequestTime
      case 20 :
        data = val.map(initToRequestTime => ({ ...genData('time'), exd: { initToRequestTime } }))
        break

      // renderContentTime
      case 22 :
        data = val.map(renderContentTime => ({ ...genData('time'), exd: { renderContentTime } }))
        break

      // renderAllContentTime
      case 23 :
        data = val.map(renderAllContentTime => ({ ...genData('time'), exd: { renderAllContentTime } }))
        break

      // router
      case 30 :
        break

      // other
      default :
        if (typeof opts.callback === 'function') {
          const { data: _d, method: _m, module: _bm } = opts.callback(key, val)
          assert(
            !Array.isArray(data),
            '[data] must be an Array\n\n --- from [autoReport] plugin\n',
          )

          assert(
            typeof _bm !== 'string',
            '[module] must be an String\n\n --- from [autoReport] plugin\n',
          )
          
          // 保持需要处理的数据
          method = _m
          data = _d.map(exd => ({ ...genData(_bm), exd }))
        }
    }

    if (allowMethods.includes(method) && data.length > 0) {
      // 由于后端不支持一次性上报多条数据
      // 所以需要发送多条请求，等接口更改
      data.forEach(item => {
        wx.request({
          url,
          method,
          header,
          data: item,
        })
      })
    }
  }

  if (
    isUndef(sdk.hooks.report) ||
    typeof sdk.hooks.report === 'function' &&
    sdk.hooks.report.name === 'defaultReport'
  ) {
    sdk.hooks.report = createWraper(sdk.hooks.report, wraperReprot)
  } else {
    sdk.hooks.report = wraperReprot
  }
}
import {assert, createWraper, isUndef} from "../utils";
// 统计用户页面点击


// 默认是正式环境
let isProd = true

export default function (sdk, opts = {}) {
  assert(
    typeof opts.url !== 'string',
    'The request url must be a string.\n\n --- from [autoReport] plugin\n',
  )

  isProd = opts.isProd

  const hooks = sdk.hooks
  if (isUndef(hooks.app)) hooks.app = {}
  if (isUndef(hooks.page)) hooks.page = {}

  sdk.addCode('tapEvent', 40)
  sdk.addCode('c_buried', 41)

  hooks.page.overrideBefore = createWraper(
    hooks.page.overrideBefore,
    function (sdk, config) {
      config.tapReport = function (e) {
        let reportDataKey = e.target.dataset.zareport
        // 过滤没有声明上报的点击
        if (isUndef(reportDataKey)) return
        assert(typeof reportDataKey !== 'string', 'The zareport must be a string.\n\n --- from [tap-report] plugin\n')
        assert(!config.SDKConfig.reportData || !config.SDKConfig.reportData.hasOwnProperty(reportDataKey), `Unrecognized report params key ${reportDataKey}. --- from [tap-report] plugin`)
        // const customParams = {exd: JSON.stringify(config.SDKConfig.reportData[reportDataKey] || {})}
        const customParams = {exd: genCustomParamsStr(config.SDKConfig.reportData[reportDataKey])}
        const commonParams = genCommonParamsStr()
        const params = Object.assign(commonParams, customParams)
        const paramsStr = '?' + urlEncode(params).slice(1)
        wx.request({
          url: opts.url + paramsStr,
          success: res => {
          }
        })
      }
    }
  )

  function wrapperReport(key, val) {
    switch (key) {
      case 41:
        // 日志上报

        // val是200毫秒之内的上报数据。目前日志系统不支持合并上报，所以遍历数组分别发请求
        // assert(typeof val !== 'object', `The params must be an object.\n\n --- from [tap-report] plugin\n`)
        val.forEach(item => {
          const customParams = {exd: genCustomParamsStr(item)}
          const commonParams = genCommonParamsStr()
          const params = Object.assign(commonParams, customParams)
          const paramsStr = '?' + urlEncode(params).slice(1)
          wx.request({
            url: opts.url + paramsStr,
            success: res => {
            }
          })
        })

        break;
    }
  }

  if (
    isUndef(sdk.hooks.report) ||
    typeof sdk.hooks.report === 'function' &&
    sdk.hooks.report.name !== 'defaultReport'
  ) {
    sdk.hooks.report = createWraper(sdk.hooks.report, wrapperReport)
  } else {
    sdk.hooks.report = wrapperReport
  }
}

// 生成公共字段
function genCommonParamsStr() {
  const params = Object.create(null)

  let ramdomNum = Math.random().toString().slice(-6);
  ramdomNum = parseInt(ramdomNum).toString(16);
  let timestamp = Date.parse(new Date());
  let Oxtimestamp = parseInt(timestamp).toString(16);
  let unid = `za-${ramdomNum}-${Oxtimestamp}`

  params.unid = unid
  params.t = new Date().getTime()
  params.uid = wx.getStorageSync('__uuid') || ''
  params.p = getCurrentPages().route || 'pages/index/index'
  params.sc = 'mp'
  params.bm = "mingqi"
  params.sp = "stat"
  params.tp = 2
  return params
}

function genCustomParamsStr(param) {
  param = param || {}
  param.isProd = isProd ? 1 : 0
  return JSON.stringify(param)
}

// encode自定义参数
function urlEncode(param, key) {
  if (isUndef(param)) return ''
  let paramStr = ''
  const t = typeof param
  // 非对象
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr += '&' + key + '=' + encodeURIComponent(param)
  } else {
    assert(t !== 'object', `Unrecognized report param type ${t}. --- from [tap-report] plugin`)
    for (let k in param) {
      paramStr += urlEncode(param[k], k)
    }
  }
  return paramStr
}

import {assert, createWraper, isUndef} from "../utils";
// 统计用户页面点击


export default function (sdk, opts = {}) {
  assert(
    typeof opts.url !== 'string',
    'The request url must be a string.\n\n --- from [autoReport] plugin\n',
  )

  const hooks = sdk.hooks
  if (isUndef(hooks.app)) hooks.app = {}
  if (isUndef(hooks.page)) hooks.page = {}

  sdk.addCode('tapEvent', 40)

  hooks.page.overrideBefore = createWraper(
    hooks.page.overrideBefore,
    function (sdk, config) {
      config.tapReport = function (e) {
        let reportDataKey = e.target.dataset.zareport
        // 过滤没有声明上报的点击
        if (isUndef(reportDataKey)) return
        assert(typeof reportDataKey !== 'string', 'The zareport must be a string.\n\n --- from [tap-report] plugin\n')
        assert(!config.SDKConfig.reportData || !config.SDKConfig.reportData.hasOwnProperty(reportDataKey), `Unrecognized report params key ${reportDataKey}. --- from [tap-report] plugin`)
        const customParams = { exd: JSON.stringify(config.SDKConfig.reportData[reportDataKey] || {}) }
        const commonParams = genCommonOptions()
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
}

// 生成公共字段
function genCommonOptions() {
  const app = getApp()
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

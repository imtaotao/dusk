import {assert, createWraper} from "../utils";
// 统计用户页面点击
import {isUndef} from "../utils";

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
        assert(typeof reportDataKey !== 'string', 'The zareport must be a string.\n\n --- from [tap-report] plugin\n')
        assert(!config.SDKConfig.reportData || !config.SDKConfig.reportData.hasOwnProperty(reportDataKey), `Unrecognized report params key ${reportDataKey}. --- from [tap-report] plugin`)

        const params = config.SDKConfig.reportData[reportDataKey] || {}

        wx.request({
          url: opts.url,
          data: params,
          success: res => {
          }
        })
      }
    }
  )
}

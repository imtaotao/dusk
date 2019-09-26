import { isUndef, assert, createWraper } from '../utils'

// 首屏的各种加载时长统计
export default function (sdk, homePath) {
  assert(
    isUndef(homePath),
    '[firstScreenTime] plugin need a home page path.',
  )

  const hooks = sdk.hooks
  if (isUndef(hooks.app)) hooks.app = {}
  if (isUndef(hooks.page)) hooks.page = {}

  sdk.addCode('startTime', 20) // 小程序从 show 到 hide 的时长
  sdk.addCode('showTime', 21) // 小程序启动的时长
  sdk.addCode('renderContentTime', 22)  // 首屏有内容显示
  sdk.addCode('renderAllContentTime', 23)

  // app 里面需要记录的时间
  hooks.app.onShow = createWraper(
    hooks.app.onShow,
    function () {
      if (!isUndef(homePath)) {
        sdk.time('renderContentTime')
      }

      // 打点记录渲染所有时长的时间，具体的接口在业务中写
      sdk.time('renderAllContentTime')

      // 记录当前 app 从显示到隐藏，一共停留的时长
      sdk.time('showTime')
      // 记录初始化的时长
      const duration = sdk.timeEnd('startTime')
      sdk.report('startTime', duration)
    },
  )
    
  hooks.app.onHide = createWraper(
    hooks.app.onHide,
    function () {
      const duration = sdk.timeEnd('showTime')
      sdk.report('showTime', duration)
    },
  )

  hooks.app.onError = createWraper(
    hooks.app.onError,
    function (errMsg) {
      // 自动上报在 app 里面捕获到的错误
      sdk.report('catchGlobalError', errMsg)
    },
  )

  // 首页渲染完成的时间
  if (!isUndef(homePath)) {
    hooks.page.onReady = createWraper(
      hooks.app.onReady,
      function (sdk, page) {
        if (homePath === page.route) {
          const duration = sdk.timeEnd('renderContentTime')
          sdk.report('renderContentTime', duration)
        }
      },
    )
  }

  return () => {
    const duration = sdk.timeEnd('renderAllContentTime')
    sdk.report('renderAllContentTime', duration)
  }
}
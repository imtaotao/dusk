import {
  once,
  assert,
  isUndef,
  createWraper,
} from '../utils'

// 首屏的各种加载时长统计
export default function (sdk, homePath) {
  assert(
    isUndef(homePath),
    'Need a home page path.\n\n --- from [firstScreenTime] plugin\n',
  )

  const hooks = sdk.hooks
  if (isUndef(hooks.app)) hooks.app = {}
  if (isUndef(hooks.page)) hooks.page = {}
  
  sdk.addCode('initToRequestTime', 20) // 初始化到发起请求的时间
  sdk.addCode('showTime', 21) // 小程序启动的时长
  sdk.addCode('renderContentTime', 22)  // 首屏有内容显示
  sdk.addCode('renderAllContentTime', 23) // 所有内容显示的时间

  // app 里面需要记录的时间
  hooks.app.onLaunch = createWraper(
    hooks.app.onLaunch,
    () => {
      // 记录初始化的时间
      sdk.time('initToRequestTime')
    },
  )

  hooks.app.onShow = createWraper(
    hooks.app.onShow,
    () => {
      if (!isUndef(homePath)) {
        sdk.time('renderContentTime')
      }
      // 打点记录渲染所有时长的时间，具体的接口在业务中写
      sdk.time('renderAllContentTime')
      // 记录当前 app 从显示到隐藏，一共停留的时长
      sdk.time('showTime')
    },
  )
    
  hooks.app.onHide = createWraper(
    hooks.app.onHide,
    () => {
      const duration = sdk.timeEnd('showTime')
      sdk.report('showTime', duration)
    },
  )

  hooks.app.onError = createWraper(
    hooks.app.onError,
    errMsg => {
      // 自动上报在 app 里面捕获到的错误
      sdk.report('catchGlobalError', errMsg)
    },
  )

  // 首页渲染完成的时间
  if (!isUndef(homePath)) {
    hooks.page.onReady = createWraper(
      hooks.app.onReady,
      (sdk, page) => {
        if (homePath === page.route) {
          const duration = sdk.timeEnd('renderContentTime')
          sdk.report('renderContentTime', duration)
        }
      },
    )
  }

  // 在 SDK 中添加当前这个插件的方法
  sdk.firstScreen = {
    initToRequest: once(() => {
      const duration = sdk.timeEnd('initToRequestTime')
      sdk.report('initToRequestTime', duration)
    }),
    
    renderAllTime: once(() => {
      const duration = sdk.timeEnd('renderAllContentTime')
      sdk.report('renderAllContentTime', duration)
    }),
  }
}
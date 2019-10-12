import createSDK, {plugins} from './sdk/wxsdk.esm'

const SDK = createSDK()

SDK.addPlugin(plugins.firstScreenTime)
SDK.addPlugin(plugins.autoReport, {
  projectName: 'mpp',
  uid: () => 'testUserId',
  url: 'https://app.jiebao.zhenai.com/monitor/monitor.gif'
})
SDK.addPlugin(plugins.tapReport, {
  url: 'https://app.jiebao.zhenai.com/monitor/monitor.gif'
})

//app.js
App({

  onLaunch: function () {
    console.log('launch')
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  onShow() {
    console.log('appshow')
    setTimeout(() => {
      console.log(SDK.router.getCurrentPage())
    })
  },

  globalData: {
    userInfo: null
  }
})

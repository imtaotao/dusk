//index.js
//获取应用实例
const app = getApp()

Page({
  SDKConfig: {
    onLoad: {
      report1(sdk, page) {
        console.log(page.data);
      },
      report2(sdk, page) {
        console.log(2222)
      }
    },
    onShow: {
      report3(sdk, page) {
        console.log(123)
      }
    },
    update: {
      update1(params) {
        console.log('update', params)
      }
    },
    updateAfterSetData: {
      updateAfterSetData(params) {
        console.log('autoUpdate', params, 1)
      }
    },
    // report参数
    reportData: {
      qweData: {
        type: 'ewqewq clicked',
        aa: 1
      },
      param1: {
        report: 'ewqewq'
      }
    }
  },
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    memberId: 123123
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onShow() {

    this.queryMultipleNodes()
    setTimeout(() => {
      this.setData({
        aaa: 1
      })
      this.SDK.update(this, 'update1', 321)
    }, 3000)
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  jump() {
    wx.navigateTo({
      url: '/pages/logs/logs'
    })
  },

  handelTap(e) {
    console.log(e);
  },

  queryMultipleNodes() {
    wx.createSelectorQuery()
        .selectAll('.rp')
        .fields({
          context: true,
          node: true,
          dataset: true
        }, res => {
          console.log('res', res);
        })
        .exec()
  }
})

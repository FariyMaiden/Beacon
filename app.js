//app.js
const CryptoJS = require('./utils/AES')
const dataUtil = require('./utils/util.js') 
App({
  onLaunch: function () {

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

  /**
   * 加密方法
   */
  Encrypt: function (data) {
    var key = CryptoJS.enc.Latin1.parse('j>r%T.w8#7*6J\"t%i#o8#7*6');
    var iv = CryptoJS.enc.Latin1.parse('T@Rj<_2io.T^&t\"j');

    var ADEData
    if (data == null) {
      ADEData = dataUtil.formatTime1(new Date())
    } else {
      ADEData = data
    }
    console.log(ADEData)
    return CryptoJS.AES.encrypt(ADEData, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding }).toString();
  },

  
  globalData: {
    userInfo: null
  }
})
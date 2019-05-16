//app.js
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
  //请求模板
  // getExpressInfo:function(nu,cb){
  //   wx.request({
  //     url: '' + nu,
  //     data:{
  //       name:'',

  //     },
  //     header: {
  //     },
  //     success:function(res){
  //       cb(res.data)
  //     }
    
  //   })
   
    
  // },
  globalData: {
    userInfo: null,
    NLPCusid: "",
    wordUrl:"https://can.xmduruo.com:4000/wechatroutine/byWord.do",
  },
  setCusid: function () {
    var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    var cusidLength = 30, cusid = '';
    for (var i = 0; i < cusidLength; i++) {
      var oneStr = str.charAt(Math.floor(Math.random() * str.length));
      cusid += oneStr;
    }
    this.globalData.NLPCusid = cusid;
    console.log("[Console log]:New cusid:" + cusid);
  },
  //猜测第一个参数是进去的，第二个是返回的
  xuhuiRequest:function(word,arg){
    var that = this;
    var timestamp = new Date().getTime();
    //后面这里要加id
    var rqJson={"word":word};
    
    var wordUrl = that.globalData.wordUrl;
    wx.request({
      url: wordUrl,//java后台文字
      data: JSON.stringify(rqJson),
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {
        var resData = res.data;
        console.log("[Console log]:xuhuiRequest() success...");
        console.log("[Console log]:Result:");
        console.log(resData);
        // var data = JSON.stringify(resData);
        var data = resData
        console.log(data);
        typeof arg.success == "function" && arg.success(data);

      },
      fail: function (res) {
        console.log("[Console log]:xuhuiRequest() failed...");
        console.error("[Console log]:Error Message:" + res.errMsg);
        typeof arg.fail == "function" && arg.fail();
      },
      complete: function () {
        console.log("[Console log]:xuhuiRequest() complete...");
        typeof arg.complete == "function" && arg.complete();
      }

    })
  },
})
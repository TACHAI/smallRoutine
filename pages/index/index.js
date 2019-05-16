//index.js
//获取应用实例
var app = getApp();
var that;
var chatListData = [];
var speakerInterval;

var recorderManager = wx.getRecorderManager();
recorderManager.onStart(()=>{
  //开始录制的回调方法
})
//录音停止函数
recorderManager.onStop((res)=>{
  const {tempFilePath} = res;
  //上传录制的音频
  wx.uploadFile({
    url: 'https://can.xmduruo.com:4000/wechatroutine/byVice.do',//java后台地址
    filePath: tempFilePath,
    name: 'file',
    // name: 'file',
    //formData: { "appKey": appkey, "appSecret": appsecret, "userId": NLPCusid },
    header: { 'content-type': 'multipart/form-data' },
    success: function (res) {
      wx.hideLoading();
      // var data = res.data;
      var data = JSON.parse(res.data);
      // var seg = JSON.parse(data);
      console.log("[Console log]:Voice to char:" + data);
      // if (seg == null || seg.length == 0) {
      if (data == null || data.length == 0) {

        wx.showModal({
          title: '录音识别失败',
          content: "我什么都没听到，你再说一遍！",
          showCancel: false,
          success: function (res) {
          }
        });
        return;
      }
      // that.addChat(data.data, 'r');
      that.addChat(data.data,'1')
      console.log("[Console log]:Add user voice input to chat list");
      // that.sendRequest(seg);
      return;
    },
    fail: function (res) {
      console.log("[Console log]:Voice upload failed:" + res);
      wx.hideLoading();
      wx.showModal({
        title: '录音识别失败',
        content: "请你离WIFI近一点再试一次！",
        showCancel: false,
        success: function (res) {
        }
      });
    }
  })
})

var options = {
  duration: 200000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50
}

Page({
  data: {
    defaultCorpus: '你都会什么',
    askWord: '',
    sendButtDisable: true,
    userInfo: {},
    chatList: [],
    scrolltop: '',
    userLogoUrl: '/res/image/user_default.png',
    keyboard: true,
    isSpeaking: false,
    speakerUrl: '/res/image/speaker0.png',
    speakerUrlPrefix: '/res/image/speaker',
    speakerUrlSuffix: '.png',
    filePath: null,
    contactFlag: true,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log("[Console log]:Loading...");
    that = this;
    // app.getUserInfo(function (userInfo) {
    //   var aUrl = userInfo.avatarUrl;
    //   if (aUrl != null) {
    //     that.setData({
    //       userLogoUrl: aUrl
    //     });
    //   }
    // });
    //this.sendRequest(this.data.defaultCorpus);
  },




  onLoad: function () {

    if (app.globalData.userInfo) {
      console.log(1)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      console.log(2)
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log(12)
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      console.log(3)
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        },
        fail: res => {
          console.log(4);
          this.setData({
            getUserInfoFail: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(5);
    console.log(e)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    } else {
      this.openSetting();
    }

  },
  login: function () {
    console.log(111)
    var that = this
    // if (typeof success == "function") {
    //   console.log(6);
    //   console.log('success');
    //   this.data.getUserInfoSuccess = success
    // }
    wx.login({
      success: function (res) {
        var code = res.code;
        console.log(code);
        wx.getUserInfo({
          success: function (res) {
            console.log(7);
            app.globalData.userInfo = res.userInfo
            that.setData({
              getUserInfoFail: false,
              userInfo: res.userInfo,
              hasUserInfo: true

            })
            //平台登录
          },
          fail: function (res) {
            console.log(8);
            console.log(res);
            that.setData({
              getUserInfoFail: true
            })
          }
        })
      }
    })
  },
  //跳转设置页面授权
  openSetting: function () {
    var that = this
    if (wx.openSetting) {
      wx.openSetting({
        success: function (res) {
          console.log(9);
          //尝试再次登录
          that.login()
        }
      })
    } else {
      console.log(10);
      wx.showModal({
        title: '授权提示',
        content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
      })
    }
  },








  onReady:function(){

  },
  //切换语音输入和文字输入
  switchInputType: function () {
    this.setData({
      keyboard: !(this.data.keyboard),
    })
  },
  // 监控输入框输入
  Typing: function (e) {
    var inputVal = e.detail.value;
    var buttDis = true;
    if (inputVal.length != 0) {
      var buttDis = false;
    }
    that.setData({
      sendButtDisable: buttDis,
    })
  },
  // 按钮按下
  touchdown: function () {
    this.setData({
      isSpeaking: true,
    })
    that.speaking.call();
    console.log("[Console log]:Touch down!Start recording!");
    // wx.startRecord({
    //   'success': function (res) {
    //     var tempFilePath = res.tempFilePath;
    //     that.data.filePath = tempFilePath;
    //     console.log("[Console log]:Record success!File path:" + tempFilePath);
    //     that.voiceToChar();
    //   },
    //   'fail': function () {
    //     console.log("[Console log]:Record failed!");
    //     wx.showModal({
    //       title: '录音失败',
    //       content: '换根手指再试一次！',
    //       showCancel: false,
    //       confirmText: '确定',
    //       confirmColor: '#09BB07',
    //     })
    //   },
    // });
    recorderManager.start(options)

  },
  // 按钮松开
  touchup: function () {
    //过时的方法
    //wx.stopRecord();
    //触发录音停止
    recorderManager.stop()
    console.log("[Console log]:Touch up!Stop recording!");
    this.setData({
      isSpeaking: false,
      speakerUrl: '/res/image/speaker0.png',
    })
    clearInterval(that.speakerInterval);
  },
  // 语音转文字
  voiceToChar: function () {
    var urls = app.globalData.slikToCharUrl;
    var voiceFilePath = that.data.filePath;
    if (voiceFilePath == null) {
      console.log("[Console log]:File path do not exist!");
      wx.showModal({
        title: '录音文件不存在',
        content: '我也不知道哪错了，反正你就再试一次吧！',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#09BB07',
      })
      return;
    }
    var appkey = app.globalData.NLPAppkey;
    var appsecret = app.globalData.NLPAppSecret;
    var NLPCusid = app.globalData.NLPCusid;
    wx.showLoading({
      title: '语音识别中...',
    })
    wx.uploadFile({
      url: urls,
      filePath: voiceFilePath,
      name: 'file',
      formData: { "appKey": appkey, "appSecret": appsecret, "userId": NLPCusid },
      header: { 'content-type': 'multipart/form-data' },
      success: function (res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        var seg = JSON.parse(data.result).seg;
        console.log("[Console log]:Voice to char:" + seg);
        if (seg == null || seg.length == 0) {
          wx.showModal({
            title: '录音识别失败',
            content: "我什么都没听到，你再说一遍！",
            showCancel: false,
            success: function (res) {
            }
          });
          return;
        }
        that.addChat(seg, 'r');
        console.log("[Console log]:Add user voice input to chat list");
        that.sendRequest(seg);
        return;
      },
      fail: function (res) {
        console.log("[Console log]:Voice upload failed:" + res.errMsg);
        wx.hideLoading();
        wx.showModal({
          title: '录音识别失败',
          content: "请你离WIFI近一点再试一次！",
          showCancel: false,
          success: function (res) {
          }
        });
      }
    });
  },



  // 发送文字到后台
  sendChat: function (e) {
    let word = e.detail.value.ask_word ? e.detail.value.ask_word : e.detail.value;
    console.log("[Console log]:User input:" + word);
    that.addChat(word, 'r');
    console.log("[Console log]:Add user input to chat list");
    that.setData({
      askWord: '',
      sendButtDisable: true,
    });
    that.sendRequest(word);
  },
  // 发送请求到后台
  sendRequest(word) {
    app.xuhuiRequest(word, {
      'success': function (res) {
        if (res.status == "error") {
          wx.showToast({
            title: '返回数据有误！',
          })
          return;
        }
        // var resjson = JSON.parse(res);
        // var data = JSON.stringify(resjson.data);
        that.ReturnProcess(res.data);
      },
      'fail': function (res) {
        wx.showToast({
          title: '请求失败！',
        })
        return;
      }
    });
  },
 
  // 处理返回的数据
  ReturnProcess: function (res) {
    var data = res;
    console.log(data)
    var backWord = data;
    if (backWord == null || backWord.length == 0) {
      wx.showToast({
        title: '返回数据有误！',
      })
      return;
    }
    var answer = backWord;
    console.log(answer+"23333")
    if (answer == null) {
      wx.showToast({
        title: '返回数据有误！',
      })
      return;
    }
    console.log("[Console log]:Add answer to chat list...");
    that.addChat(answer, 'l');
   
    // var dataArray = nliArray[0].data_obj;
    // if (dataArray != null && dataArray.length > 0) {
    //   var objType = nliArray[0].type;
    //   if (objType == 'selection' && dataArray.length > 1) {
    //     that.newsProcess(dataArray);
    //     return;
    //   }
    //   if (objType == 'news' && dataArray.length == 1) {
    //     console.log("[Console log]:Add news to chat list...");
    //     var title = dataArray[0].title;
    //     var detail = dataArray[0].detail;
    //     var news = title + "\n" + detail;
    //     that.addChat(news, 'l');
    //     return;
    //   }
    //   var content = dataArray[0].content;
    //   if (content != null && content != answer) {
    //     console.log("[Console log]:Add content to chat list...");
    //     that.addChat(content, 'l');
    //   }
    // }
    return;
  },
  // 新闻类处理
  // newsProcess(selectionArray) {
  //   console.log("[Console log]:Selection display...");
  //   for (var i = 0; i < selectionArray.length; i++) {
  //     var title = selectionArray[i].title;
  //     var detail = selectionArray[i].detail;
  //     var selectiondetail = "[第" + (i + 1) + "条]:" + title + "\n" + detail;
  //     that.addChatWithFlag(selectiondetail, 'l', false);
  //   }
  // },
  // 增加对话到显示界面（scrolltopFlag为True）
  addChat: function (word, orientation) {
    that.addChatWithFlag(word, orientation, true);
  },
  // 增加对话到显示界面（scrolltopFlag为是否滚动标志）
  addChatWithFlag: function (word, orientation, scrolltopFlag) {
    let ch = { 'text': word, 'time': new Date().getTime(), 'orientation': orientation };
    chatListData.push(ch);
    var charlenght = chatListData.length;
    console.log("[Console log]:Add message to chat list...");
    if (scrolltopFlag) {
      console.log("[Console log]:Rolling to the top...");
      that.setData({
        chatList: chatListData,
        scrolltop: "roll" + charlenght,
      });
    } else {
      console.log("[Console log]:Not rolling...");
      that.setData({
        chatList: chatListData,
      });
    }
  },
  // 麦克风帧动画 
  speaking: function () {
    //话筒帧动画 
    var i = 0;
    that.speakerInterval = setInterval(function () {
      i++;
      i = i % 7;
      that.setData({
        speakerUrl: that.data.speakerUrlPrefix + i + that.data.speakerUrlSuffix,
      });
      console.log("[Console log]:Speaker image changing...");
    }, 300);
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})

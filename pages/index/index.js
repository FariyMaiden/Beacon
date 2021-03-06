//index.js
//获取应用实例
const app = getApp()
const dataUtil = require('../../utils/util.js') 

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hsUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // 蓝牙参数
    status: "",
    sousuo: "",
    devices:[],//搜索到的设备
    connectedDeviceId: "", //已连接设备uuid  
    services: "", // 连接设备的服务  
    characteristics: "",   // 连接设备的状态值  
    writeServicweId: "", // 可写服务uuid  
    writeCharacteristicsId: "",//可写特征值uuid  
    readServicweId: "", // 可读服务uuid  
    readCharacteristicsId: "",//可读特征值uuid  
    notifyServicweId: "", //通知服务UUid  FE01001a753100000A00120c68AAAAAAAAAAAA681300DF161800
    notifyCharacteristicsId: "", //通知特征值UUID  FEFEFEFE68AAAAAAAAAAAA681300DF16
    inputValue: "FEFEFEFE68AAAAAAAAAAAA681300DF16",
    characteristics1: "", // 连接设备的状态值 

    hiddenmodalput:true,//隐藏弹出框

    receiveData:'',//接收到的数据

    macs:[],
    choseMac:'',
    choseName:'',

    platform:'',//手机平台 ios还是
   
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 加载页面
  onLoad: function () {
    var that = this 
    
    // this.openBluetoothAdapter()
    // 获取手机的操作系统
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.platform)
        that.setData({
          platform: res.platform
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 点击搜索按钮的事件
   */
  foundLanya(){
    // 断开连接
    this.lanya0()

    // 关闭蓝牙适配器
    this.closeBluetoothAdapter()

    // 清空搜索列表
    this.setData({
      devices:[]
    })

    var that = this
    setTimeout(function(){
      that.openBluetoothAdapter()
    },500)
    // 开启蓝牙适配器
    



  },

  /**
   *蓝牙事件处理
   */


  /**
   * 监听蓝牙适配器
   */
  onBluetoothAdapterStateChange(){
    var that = this
   
    wx.onBluetoothAdapterStateChange(function (res) {

      that.setData({
        sousuo: res.discovering ? "在搜索。" : "未搜索。",
        status: res.available ? "可用。" : "不可用。",
      })
      if (!res.available) {
        wx.hideLoading()
        that.setData({
          devices:[]
        })       
      }
    })
  
  },


  /**
   * 初始化蓝牙适配器
   */
  openBluetoothAdapter(){
    // 监听
    this.onBluetoothAdapterStateChange()

    var that= this
    console.log('开启蓝牙适配')
    

    wx.openBluetoothAdapter({
      success: function (res) {
        wx.hideLoading()
        that.setData({
          msg: "初始化蓝牙适配器成功！" + JSON.stringify(res),
        })
      // 读取状态
      that.getBluetoothAdapterState()


      },
      fail(res) {
        wx.showToast({

          title: '蓝牙初始化失败',

          icon: 'success',

          duration: 2000

        }),
          console.log(res)
      }
    })
  },

  /**
   * 关闭蓝牙适配器
   */
  closeBluetoothAdapter(){
    wx.closeBluetoothAdapter({
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },



/**
 * 获取蓝牙适配器的状态
 */
  getBluetoothAdapterState(){
    var that = this;
    console.log('获取并监听本机蓝牙状态')
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log(res)
        that.setData({
          msg: "本机蓝牙适配器状态" + "/" + JSON.stringify(res.errMsg),
          sousuo: res.discovering ? "在搜索。" : "未搜索。",
          status: res.available ? "可用。" : "不可用。",
        })

        if (res.available){
          // 开始搜索
          that.startBluetoothDevicesDiscovery()
        }

      }
    })
  },

  /**
   * 开始搜索设备
   */
  startBluetoothDevicesDiscovery(){

    // 断开已有的连接
    this.lanya0()

    this.setData({
      receiveData: '',
    })

    // 监听搜索到的设备
    this.onBluetoothDeviceFound()

    // 监听设备的连接状态
    this.onBLEConnectionStateChange()

    var that = this;

    wx.showLoading({
      title: '搜索设备',
    })
    wx.startBluetoothDevicesDiscovery({
      services: ['FEE7'],

      success: function (res) {

        // wx.hideLoading()
        that.setData({
          msg: "搜索设备" + JSON.stringify(res),
        })

        console.log('成功开始蓝牙搜索')

      },
      complete: function (res) {
        // console.log(res)
        wx.hideLoading()
      }
    })
  },



  /**
   * 获取已连接的设备
   */
  getConnectedBluetoothDevices(){

  },

  /**
   * 监听搜索到的新设备
   * 监听到的是一个数组，但是数组里面只有一个设备
   */
  onBluetoothDeviceFound(){
    var that = this
    wx.onBluetoothDeviceFound(function(res){

        // console.log('新设备名' + res.devices[0].name)
        console.log('监听' + JSON.stringify(res))
        
        var mac = that.buf2hex(res.devices[0].advertisData).substring(4)
        
      
        // 标记
        var isnotExist = true

        for (var i = 0; i < that.data.devices.length; i++) {
          if (res.devices[0].deviceId == that.data.devices[i].deviceId) {
            isnotExist = false //存在
          }
        }

        // 如果是安卓手机，还要判断mac与deviceid是否相同
        console.log(mac)
        var device = res.devices[0].deviceId.replace(/:/g,'')
        console.log(device)
        if (that.data.platform != 'ios' && mac.toUpperCase() != device){
          isnotExist = false
        }

        if (isnotExist) {
          that.setData({
            devices: that.data.devices.concat(res.devices),
            macs: that.data.macs.concat([mac])
          })
        }
    })
  },

  /**
   * 停止搜索设备
   */
  stopBluetoothDevicesDiscovery(){
    var that = this
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        that.setData({
          msg: "停止搜索周边设备" + "/" + JSON.stringify(res.errMsg),
          sousuo: res.discovering ? "在搜索。" : "未搜索。",
          status: res.available ? "可用。" : "不可用。",
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  /**
   * 连接设备
   */
  createBLEConnection(e){
    var that = this;
    wx.showLoading({
      title: '连接中',
      mask: true,
    })

    var index = e.currentTarget.dataset.index

    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      success: function (res) {
      
        console.log(res.errMsg);
        that.setData({
          connectedDeviceId: e.currentTarget.id,
          choseMac: that.data.macs[index],
          choseName:that.data.devices[index].name,
          msg: "已连接" + e.currentTarget.id,
          msg1: "",
        })
        // 获取服务和特征
        that.getBLEDeviceServices()

      },
      fail: function (res) {
        console.log(res)
        console.log("调用失败");

        wx.showModal({
          title: '失败',
          content: '连接失败',
          success: function (res) {
            if (res.confirm) {

            } else if (res.cancel) {

            }
          }
        })


      },
      complete: function () {
        wx.hideLoading()
        console.log("调用结束");
      }

    })
   
  },

  /**
   * 监听设备的连接状态
   * 
   */
  onBLEConnectionStateChange: function () {
    var that = this
    console.log('开始监听设备连接状态')
    wx.onBLEConnectionStateChange(function (res) {
      if (!res.connected) {
        wx.hideLoading()
        // 断开连接后，将原来的数据清空
        console.log('断开连接')
        
        that.setData({
          connectedDeviceId: "",
        })
      } else {
        console.log(res.deviceId + '连接')
      }
    })
  },
 

  /**
   * 获取设备的服务
   */
  getBLEDeviceServices() {
    var that = this;
    wx.showLoading({
      title: '获取服务',
      mask: true,
    })

    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log('device services:', JSON.stringify(res.services));
        that.setData({
          services: res.services,
          msg: JSON.stringify(res.services),
        })

        that.getBLEDeviceCharacteristics()
      },
      fail: function (res) {
        console.log('获取失败')
        console.log(res)

      },
      complete() {
        wx.hideLoading()
      }
    })
  },

  /**
  * 获取连接设备的所有特征值
  */
  getBLEDeviceCharacteristics: function () {
    var that = this;
    wx.showLoading({
      title: '获取特征',
      mask: true,
    })
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.services[0].uuid,
      success: function (res) {

        console.log('特征值：' + JSON.stringify(res.characteristics))
        for (var i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].properties.notify || res.characteristics[i].properties.indicate) {
            that.setData({
              notifyServicweId: that.data.services[0].uuid,
              notifyCharacteristicsId: res.characteristics[i].uuid,
            })
          }
          if (res.characteristics[i].properties.write) {
            that.setData({
              writeServicweId: that.data.services[0].uuid,
              writeCharacteristicsId: res.characteristics[i].uuid,
            })

          } else if (res.characteristics[i].properties.read) {
            that.setData({
              readServicweId: that.data.services[0].uuid,
              readCharacteristicsId: res.characteristics[i].uuid,
            })
          }
        }

        //  启用蓝牙特征值变化是的notify功能
        that.notifyBLECharacteristicValueChange()

        // 获取设备发送回来回调的数据 
        that.onBLECharacteristicValueChange()

        // 发送数据
        that.lanya8()



        that.setData({
          msg: JSON.stringify(res.characteristics),
        })
      },
      fail: function (res) {

        console.log("fail");
        console(res)
      },
      complete: function () {
        console.log("complete");
        wx.hideLoading()
      }
    })
  },

  
  /**
   *启用低功耗蓝牙设备特征值变化时的 notify 功能
   */
  notifyBLECharacteristicValueChange: function () {
    var that = this;

    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能  
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.notifyServicweId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.notifyCharacteristicsId,
      success: function (res) {
        console.log('启用notify功能')
        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
      },
      fail: function () {
        console.log('shibai');
        console.log(that.data.notifyServicweId);
        console.log(that.data.notifyCharacteristicsId);
      },
    })
  },

  /**
   * 获取设备回调发送回来的数据
   */
  onBLECharacteristicValueChange(){

    this.setData({
      receiveData: ''
    })

    var that = this
    wx.onBLECharacteristicValueChange(function (characteristic){
      console.log('监听回调')
      const result = characteristic.value;
      console.log(typeof (characteristic.value) )
      
      const hex = that.data.receiveData + that.buf2hex(result);
      that.setData({
        receiveData:hex
      })
      console.log(hex);
      console.log(hex.length);

      //判断接受的字符长度 来决定是否需要进行网络请求
      // 最后一帧少于20个字节就认为是结束
      if ( that.buf2hex(result).length < 40){
        console.log("网路请求")
        that.CheckBLE(hex)
      }

    })
  },

  /**
  * ArrayBuffer 转换为  Hex
  */
  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },





  //断开设备连接  
  lanya0: function () {

    this.setData({
      receiveData: ''
    })

    var that = this;
    wx.closeBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        that.setData({
          connectedDeviceId: "",
        })
      }
    })
  },


  //监听input表单  
  inputTextchange: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },


  //发送  
  lanya8: function () {

    this.setData({
      receiveData: ''
    })

    // this.onBLECharacteristicValueChange()

    var that = this;

    var hex = this.data.inputValue

    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))

    console.log(typedArray.length)
    var buf = typedArray.buffer

    // this.setData({
    //   times: Math.ceil(typedArray.length / 16)
    // })

    var buffer = this.stringToBytes("START")
    console.log('buffer:' + buffer)

    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.writeServicweId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.writeCharacteristicsId,
      // characteristicId:'0000FFB1-0000-1000-8000-00805F9B34FB',
      // 这里的value是ArrayBuffer类型  
      value: buf,
      success: function (res) {
        // wx.showToast({
        //   title: '发送成功',
        //   duration: 2000,
        // })
        console.log('成功写入')
        // that.lanya10()
    
      },
      fail(res) {
        // 断开连接
        that.lanya0()
        console.log('写入失败')
        console.log(res)
        wx.showModal({
          title: '失败',
          content: "发送数据失败",
          success: function (res) {
            if (res.confirm) {

            } else if (res.cancel) {

            }
          }
        })
      }
    })

  },

  /**
   *网络请求
   *将接受到的蓝牙的特征值发送到服务器解析 
   */
  CheckBLE:function(buf){
    var that = this 
    var params = {
      name:this.data.choseName,
      mac:this.data.choseMac,
      buf:buf,
      // name:'BT000001',
      // mac:'12345587efae',
      // buf:'FEFEFEFE680100000000016893063433333333349F16',
      time: dataUtil.formatTime1(new Date())
    }
    // console.log(params)

    console.log(app.Encrypt(JSON.stringify(params)))

    wx.showLoading({
      title: '加载中',
    })

    console.log(JSON.stringify(params))
    wx.request({
      url: 'https://www.trjiot.com/webiot.asmx/CheckBLE',
      data: {
        evalue: app.Encrypt(JSON.stringify(params))
      },

      header: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
      method: 'POST',
      // dataType: 'json',
      // responseType: 'text',
      success: function(res) {
        console.log(res)
        var result = JSON.parse(res.data.replace(/<[^>]+>/g, "").replace(/[' '\r\n]/g, ""))
        console.log(result)

        wx.showModal({
          title: result.status,
          content: result.data,
          success: function (res) {
            if (res.confirm) {
            
            } else if (res.cancel) {
             
            }
          }
        })


      },
      fail: function(res) {
        console.log(res)
      },
      complete: function(res) {
        // 断开蓝牙
        that.lanya0()
        wx.hideLoading()

      },
    })
  },

  /**
   * 显示输入modal
   */
  showInputModel(){
    this.setData({
      hiddenmodalput:false
    })
  },

  //取消按钮  
  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认  
  confirm: function () {
    this.setData({
      hiddenmodalput: true
    })

    this.lanya8()

  },

  // 字符串转byte  
  stringToBytes(str) {  
    var array = new Uint8Array(str.length);  
    for(var i = 0, l = str.length; i<l; i++) {  
  array[i] = str.charCodeAt(i);
}
console.log(array);
return array.buffer;  
},

  //接收消息  
  lanya10: function () {
    var that = this;
    // 必须在这里的回调才能获取  
    // wx.onBLECharacteristicValueChange(function (characteristic) {
    //   let hex = Array.prototype.map.call(new Uint8Array(characteristic.value), x => ('00' + x.toString(16)).slice(-2)).join('');
    //   console.log('监听特征值的变化')
    //   console.log(hex)
    // })
    console.log(that.data.readServicweId);
    console.log(that.data.readCharacteristicsId);

    wx.readBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.readServicweId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
      characteristicId: that.data.readCharacteristicsId,
      success: function (res) {
        console.log('readBLECharacteristicValue:', res.errMsg);
      }
    })
  },




})

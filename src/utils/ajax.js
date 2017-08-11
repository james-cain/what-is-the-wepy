import { hexSha1 } from './sha1'
import wepy from 'wepy'
let CTP = function() {
  let weChatAccount = JSON.parse(wx.getStorageSync('weChatAccount'))

  let session = wx.getStorageSync('session')

  let SERVER_URL = 'http://mspshow.szcomtop.com'

  function checkLogin () {
    let curSession = wx.getStorageSync('session') === '' ? null : JSON.parse(wx.getStorageSync('session'))
    let bool = true
    if (curSession === null) {
      bool = false
    } else {
      if (curSession.sessionId === '') {
        bool = false
      } else if (curSession.user.userId === '') {
        bool = false
      } else if (curSession.user.chargeMiniAppId === '') {
        bool = false
      }
      if (curSession.user !== 'undefined') {
        bool = true
      }
    }
    return bool
  }

  function extend (o1, o2) {
    for (let key in o2) {
      o1[key] = o2[key]
    }
    return o1
  }

  function Ajax (args, timeout) {
    function getAjax (o) {
      let _def = {
        dataType: 'json',
        cache: true,
        show: false,
        validSession: true,
        fail: function () {
          console.log('请求失败')
        }
      }
      let _args = o.params
      let argsStr = ''
      let keyAry = []
      let signStr = ''

      _def = extend(_def, o)

      for (let i in _args) {
        keyAry.push(i)
      }
      argsStr += _args['appSecret']
      keyAry = keyAry.sort()
      keyAry.forEach((e, index, Arr) => {
        argsStr += (e + _args[e])
      })
      argsStr += _args['appSecret']

      signStr = hexSha1(argsStr).toUpperCase()

      _def.params.sign = signStr
      console.log('正在发生请求，参数为：')
      console.log(_def.params)

      wepy.request({
        url: SERVER_URL + _def.url,
        method: 'GET',
        dataType: _def.dataType,
        data: _def.params,
        success: function (data) {
          _def.success.call(this, data, _def.params)
        },
        fail: _def.fail
      })
    }
    getAjax(args)
  }

  function getHomeInfo (success) {
    let curSession = JSON.parse(wx.getStorageSync('session'))
    let homeInfoParams = {
      userCode: curSession.user.userId,
      nonce: 'abc',
      v: '1.0',
      format: 'json',
      method: 'home.info',
      locale: 'zh_CN',
      sessionId: curSession.sessionId,
      appKey: curSession.appKey,
      timestamp: new Date().getTime()
    }
    wepy.request({
      url: SERVER_URL + '/msp-charge/router',
      method: 'POST',
      dataType: 'json',
      data: homeInfoParams,
      success: function (m) {
        success(m)
      }
    })
  }

  function checkSession (weChatAccount, fns) {
    if (checkLogin()) {
      let curSession = JSON.parse(wx.getStorageSync('session'))
      fns.success(curSession)
      console.log('通过登陆、注册方式、缓存方式获取用户信息success：')
      console.log(curSession)
    } else {
      let _paramsLoginAuth = {
        chargeMiniAppId: weChatAccount.id,
        system: 'XNCD',
        nonce: 'abc',
        v: '1.0',
        format: 'json',
        method: 'user.auth',
        locale: 'zh_CH',
        appKey: '',
        timestamp: new Date().getTime()
      }

      wepy.request({
        url: SERVER_URL + '/msp-cas/router',
        type: 'POST',
        dataType: 'json',
        data: _paramsLoginAuth,
        success: function (e) {
          let data = e.data
          if (data.code !== '9') {
            wx.setStorageSync('session', JSON.stringify(data))
            fns.success(data)
            console.log('通过直接获取用户session方式获取用户信息success：')
            console.log(data)
          } else {
            fns.fail(data)
            console.log('通过直接获取用户session方式获取用户信息fail：')
            console.log(data)
          }
        },
        fail: function (e) {
          fns.fail(e)
        }
      })
    }
  }

  return {
    // 获取微信账号信息
    weChatAccount: weChatAccount,
    session: session,
    // 校验用户是否登录
    checkLogin: checkLogin,
    // 请求统一接口
    Ajax: Ajax,
    // 检查查询是否绑定 返回 用户所有信息
    checkSession: checkSession,
    // 首页接口，判断是否正在充电，跳转页面不同
    getHomeInfo: getHomeInfo
  }
}

export default CTP

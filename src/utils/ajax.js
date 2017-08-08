import { hexSha1 } from './sha1'
import wepy from 'wepy'
let CTP = function() {
  let weChatAccount = JSON.parse(wx.getStorageSync('weChatAccount'))

  let session = wx.getStorageSync('session')

  let SERVER_URL = 'http://mspshow.szcomtop.com'

  let getHomeInfo = function () {}

  function checkLogin () {
    let curSession = JSON.parse(wx.getStorageSync('session'))
    let bool = true
    if (curSession === null) {
      bool = false
    } else {
      if (curSession.sessionId === '') {
        bool = false
      } else if (curSession.user.userId === '') {
        bool = false
      } else if (curSession.user.weChatId === '') {
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

      console.log('argsStr:' + argsStr)

      signStr = hexSha1(argsStr).toUpperCase()

      _def.params.sign = signStr

      wepy.request({
        url: SERVER_URL + _def.url,
        method: 'GET',
        dataType: _def.dataType,
        data: _def.params,
        // cache: _def.cache,
        success: function (data) {
          // session过期
          // if (_def.validsession) {
          //   if (data.retcode === '301') {
          //     location.href = '../html/login.html'
          //   }
          // }
          _def.success.call(this, data, _def.params)
        },
        fail: _def.fail
      })
    }
    getAjax(args)
  }

  function checkSession (weChatAccount, fns) {
    console.log('==============1===============')
    let _paramsLoginAuth = {
      weChatId: weChatAccount.id,
      nonce: 'abc',
      v: '1.0',
      format: 'json',
      method: 'user.auth',
      locale: 'zh_CH',
      appKey: '00014b81addb04bf',
      timestamp: new Date().getTime()
    }

    wepy.request({
      url: SERVER_URL + '/msp-cas/router',
      type: 'POST',
      dataType: 'json',
      data: _paramsLoginAuth,
      success: function (e) {
        console.log('请求的用户---', e.user)
        if (typeof e.user !== 'undefined') {
          wx.setStorageSync('session', JSON.stringify(e))

          if (wx.getStorageSync('startTimeSession') === null) {
            wx.setStorageSync('startTimeSession', JSON.stringify(new Date().getTime()))
          }

          getHomeInfo = function (success) {
            let homeInfoParams = {
              userCode: e.user.userId,
              nonce: 'abc',
              v: '1.0',
              format: 'json',
              method: 'home.info',
              locale: 'zh_CN',
              sessionId: e.sessionId,
              appKey: '00014b81addb04bf',
              timestamp: new Date().getTime()
            }
            wepy.request({
              url: SERVER_URL + '/msp-charge/router',
              type: 'POST',
              dataType: 'json',
              data: homeInfoParams,
              success: function (m) {
                success(m)
              }
            })
          }
          fns.success(e)
          console.log('用户信息success：')
          console.log(e)
        } else {
          fns.fail(e)
          console.log('用户信息fail：')
          console.log(e)
        }
      },
      fail: function (e) {
        fns.fail(e)
      }
    })
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

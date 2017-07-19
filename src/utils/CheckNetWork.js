export default function checkNetWorkStatus() {
  let status = true
  wx.getNetWorkType({
    success: (res) => {
      // 返回网络类型2g,3g,4g,wifi,none,unknown
      let networkType = res.networkType
      if (networkType === 'none') {
        // 没有网络连接
        wx.showModal({
          title: '提示',
          content: '没有网络连接，请检查您的网络设置',
          showCancel: false
        })
        status = false
      } else if (networkType === 'unknown') {
        // 未知的网络类型
        wx.showModal({
          title: '提示',
          content: '未知的网络类型，请检查您的网络设置',
          showCancel: false
        })
        status = false
      }
    }
  })
  return status
}

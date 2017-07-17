function setModalStatus(e,context) {
  let animation = wx.createAnimation({
    duration: 200,
    timingFunction: "linear",
    delay: 0
  })
  context.animation = animation
  animation.translateY(300).step()
  context.setData({
    animationData: animation.export()
  })
  if (e.currentTarget.dataset.status == 1) {
    context.setData(
      {
        showModalStatus: true
      }
    );
  }
  setTimeout(function () {
    animation.translateY(0).step()
    context.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 0) {
      context.setData(
        {
          showModalStatus: false
        }
      );
    }
  }.bind(context), 200)
}
module.exports = {
  setModalStatus
}
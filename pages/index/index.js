
// 获取应用实例
const app = getApp();

Page({
  data: {
    items: [
      {
        image: '',
        data: null,
      },
      {
        image: '',
        data: null,
      },
      {
        image: '',
        data: null,
      }
    ]
  },
  onLoad: function () {
    
  },
  selectAlpha: function () {
    wx.navigateTo({
      url: '/pages/alpha/alpha',
    });
  },
})

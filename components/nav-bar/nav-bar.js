const themeBehavior = require('../../utils/theme-behavior');
Component({
  behaviors: [themeBehavior],
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false },
  },
  data: { statusBarHeight: 20 },
  lifetimes: {
    attached() {
      try {
        const info = wx.getSystemInfoSync();
        this.setData({ statusBarHeight: info.statusBarHeight || 20 });
      } catch(e) {}
    }
  },
  methods: {
    onBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) wx.navigateBack();
      else wx.switchTab({ url: '/pages/index/index' });
    }
  }
});

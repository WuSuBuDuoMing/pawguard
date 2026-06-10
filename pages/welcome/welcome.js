const storage = require('../../utils/storage-utils');
const { STORAGE_KEYS } = require('../../utils/constants');

Page({
  data: { step: 0 },
  onNext() {
    if (this.data.step < 4) {
      this.setData({ step: this.data.step + 1 });
    } else {
      this.enterApp();
    }
  },
  onSkip() { this.enterApp(); },
  enterApp() {
    storage.set(STORAGE_KEYS.FIRST_LAUNCH, false);
    wx.reLaunch({ url: '/pages/index/index' });
  },
});

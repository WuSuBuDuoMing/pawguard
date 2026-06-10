const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');
const invService = require('../services/inventory-service');
const healthService = require('../services/health-service');

Component({
  data: {
    selected: 0,
    isDarkMode: false,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: '🏠', badge: 0 },
      { pagePath: '/pages/care/care', text: '照护', icon: '📋', badge: 0 },
      { pagePath: '/pages/pets/pets', text: '宠物', icon: '🐾', badge: 0 },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '👤', badge: 0 },
    ],
  },

  lifetimes: {
    attached() {
      this.initTheme();
      this.loadBadges();
    }
  },

  pageLifetimes: {
    show() {
      this.initTheme();
      this.loadBadges();
    }
  },

  methods: {
    switchTab(e) {
      const { path } = e.currentTarget.dataset;
      wx.switchTab({ url: path });
    },

    initTheme() {
      try {
        const saved = wx.getStorageSync(STORAGE_KEYS.THEME_MODE);
        const isDark = saved === 'dark' ||
          (!saved && wx.getSystemInfoSync().theme === 'dark');
        this.setData({ isDarkMode: isDark });
      } catch(e) {}
    },

    /** 加载 badge 数字（低库存 + 即将过期健康记录） */
    async loadBadges() {
      try {
        // 照护 badge: 今日未完成任务数
        const lowStock = await invService.getLowStockItems();
        const list = [...this.data.list];
        list[1].badge = lowStock.length > 0 ? lowStock.length : 0;
        this.setData({ list });
      } catch(e) {}
    },
  }
});

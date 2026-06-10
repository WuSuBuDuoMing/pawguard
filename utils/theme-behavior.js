/**
 * theme-behavior.js - 暗黑模式 Behavior
 * 提供全局主题切换能力，页面/组件通过 behaviors 引入即可
 * @module theme-behavior
 */

const { COLORS, STORAGE_KEYS } = require('./constants');

const themeBehavior = Behavior({
  data: {
    isDarkMode: false,
    themeClass: 'light',
    // 便捷主题色变量，页面可直接在 WXML 中使用
    bgColor: COLORS.light.cream,
    cardColor: COLORS.light.cardBg,
    textColor: COLORS.light.textPrimary,
    textSecondaryColor: COLORS.light.textSecondary,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.light.shadow,
  },

  lifetimes: {
    attached() {
      this.initTheme();
    },
  },

  pageLifetimes: {
    show() {
      // 每次页面显示时检查主题是否变化
      this.initTheme();
    },
  },

  methods: {
    /**
     * 初始化主题：从系统设置和本地缓存中读取
     */
    initTheme() {
      try {
        // 先读取本地缓存的设置
        const saved = wx.getStorageSync(STORAGE_KEYS.THEME_MODE);
        let isDark = false;

        if (saved !== '') {
          // 有缓存设置则使用缓存
          isDark = saved === 'dark';
        } else {
          // 无缓存则跟随系统
          const sysInfo = wx.getSystemInfoSync();
          isDark = sysInfo.theme === 'dark';
        }

        this.onThemeChange(isDark);
      } catch (e) {
        console.error('[Theme] init error:', e);
      }
    },

    /**
     * 切换暗黑模式
     */
    toggleTheme() {
      const newMode = !this.data.isDarkMode;
      this.onThemeChange(newMode);
      // 保存用户设置
      wx.setStorageSync(STORAGE_KEYS.THEME_MODE, newMode ? 'dark' : 'light');
    },

    /**
     * 应用主题变化，更新所有主题相关变量
     * @param {boolean} isDark - 是否暗黑模式
     */
    onThemeChange(isDark) {
      const palette = isDark ? COLORS.dark : COLORS.light;
      this.setData({
        isDarkMode: isDark,
        themeClass: isDark ? 'dark' : 'light',
        bgColor: isDark ? palette.bg : palette.cream,
        cardColor: palette.cardBg,
        textColor: palette.textPrimary,
        textSecondaryColor: palette.textSecondary,
        borderColor: palette.border,
        shadowColor: palette.shadow,
      });
    },
  },
});

module.exports = themeBehavior;

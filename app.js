/**
 * app.js - 小程序入口文件
 * 负责全局初始化、首次启动引导和主题设置
 */
const storageUtils = require('./utils/storage-utils');
const { STORAGE_KEYS, COLORS } = require('./utils/constants');

App({
  globalData: {
    userInfo: null,
    currentPetId: null,
    isDarkMode: false,
    systemInfo: null,
    themeColors: COLORS.light,
    isFirstLaunch: false,
  },

  onLaunch(options) {
    this.initSystemInfo();
    this.initTheme();

    // 检查首次启动
    const firstLaunch = storageUtils.get(STORAGE_KEYS.FIRST_LAUNCH);
    if (firstLaunch === null || firstLaunch === undefined) {
      this.globalData.isFirstLaunch = true;
      // 不在此处跳转，由 welcome 页面自行管理
    }

    // 加载用户数据
    this.loadUserData();

    // 清除可能残留的旧 mock 数据缓存（首次安装时）
    this.cleanStaleData();
  },

  /** 初始化系统信息 */
  initSystemInfo() {
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync();
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },

  /** 初始化主题模式 */
  initTheme() {
    try {
      const saved = wx.getStorageSync(STORAGE_KEYS.THEME_MODE);
      let isDark = false;
      if (saved !== '') {
        isDark = saved === 'dark';
      } else if (this.globalData.systemInfo) {
        isDark = this.globalData.systemInfo.theme === 'dark';
      }
      this.globalData.isDarkMode = isDark;
      this.globalData.themeColors = isDark ? COLORS.dark : COLORS.light;
    } catch (e) {
      console.error('主题初始化失败:', e);
    }
  },

  /** 加载用户数据 */
  loadUserData() {
    try {
      const userInfo = storageUtils.get(STORAGE_KEYS.USER_INFO);
      if (userInfo) this.globalData.userInfo = userInfo;
      const currentPetId = storageUtils.get(STORAGE_KEYS.CACHE_PREFIX + 'currentPetId');
      if (currentPetId) this.globalData.currentPetId = currentPetId;
    } catch (e) {
      console.error('加载用户数据失败:', e);
    }
  },

  /** 清理残留数据 */
  cleanStaleData() {
    try {
      // 确保首次启动标志存在
      if (storageUtils.get(STORAGE_KEYS.FIRST_LAUNCH) === null) {
        storageUtils.set(STORAGE_KEYS.FIRST_LAUNCH, true);
      }
    } catch (e) {}
  },

  /** 设置当前选中的宠物 */
  setCurrentPet(petId) {
    this.globalData.currentPetId = petId;
    storageUtils.set(STORAGE_KEYS.CACHE_PREFIX + 'currentPetId', petId);
  },
});

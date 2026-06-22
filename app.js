/**
 * @file app.js - PawGuard (AI 宠物管家) 小程序入口文件
 *
 * 负责全局生命周期管理，包括：
 * - 系统信息初始化
 * - 主题模式（亮/暗）加载与切换
 * - 首次启动引导检测
 * - 用户数据和宠物选择状态的持久化
 *
 * @module app
 * @version 2.15.0
 */

const storageUtils = require('./utils/storage-utils');
const { STORAGE_KEYS, COLORS } = require('./utils/constants');

/**
 * 小程序应用实例
 * @see https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html
 */
App({
  /** @type {Object} 全局共享数据 */
  globalData: {
    /** @type {Object|null} 当前登录用户信息 */
    userInfo: null,
    /** @type {string|null} 当前选中宠物的 ID */
    currentPetId: null,
    /** @type {boolean} 是否启用暗黑模式 */
    isDarkMode: false,
    /** @type {Object|null} 微信系统信息缓存 */
    systemInfo: null,
    /** @type {Object} 当前主题配色方案 */
    themeColors: COLORS.light,
    /** @type {boolean} 是否为首次启动（用于触发引导页） */
    isFirstLaunch: false,
  },

  /**
   * 小程序启动生命周期
   * 按顺序初始化系统信息、主题、首次启动检测和用户数据
   * @param {Object} options - 启动参数（scene、query 等）
   */
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

  /**
   * 初始化微信系统信息
   * 获取设备型号、屏幕尺寸、系统版本等，供全局使用
   */
  initSystemInfo() {
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync();
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },

  /**
   * 初始化主题模式
   * 优先读取用户保存的偏好，其次跟随系统主题
   */
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

  /**
   * 从本地存储加载用户信息和当前选中宠物
   */
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

  /**
   * 清理残留数据，确保首次启动标志存在
   */
  cleanStaleData() {
    try {
      // 确保首次启动标志存在
      if (storageUtils.get(STORAGE_KEYS.FIRST_LAUNCH) === null) {
        storageUtils.set(STORAGE_KEYS.FIRST_LAUNCH, true);
      }
    } catch (e) {}
  },

  /**
   * 设置当前选中的宠物并持久化
   * @param {string} petId - 宠物 ID
   */
  setCurrentPet(petId) {
    this.globalData.currentPetId = petId;
    storageUtils.set(STORAGE_KEYS.CACHE_PREFIX + 'currentPetId', petId);
  },
});

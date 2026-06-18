/**
 * settings-service.js - 用户设置服务
 * 管理用户偏好、通知设置和应用配置
 */

const storage = require('../utils/storage-utils');
const { STORAGE_KEYS } = require('../utils/constants');

function _delay(ms = 100) { return new Promise(r => setTimeout(r, ms)); }

const DEFAULT_SETTINGS = {
  notifications: {
    careReminder: true,    // 照护提醒
    vaccineReminder: true, // 疫苗提醒
    dewormingReminder: true, // 驱虫提醒
    inventoryAlert: true,  // 库存预警
    dailyReport: false,    // 每日报告
  },
  display: {
    theme: 'auto',    // 'light' | 'dark' | 'auto'
    language: 'zh-CN',
    showEmoji: true,
    compactMode: false,
  },
  data: {
    autoBackup: false,
    lastBackupDate: null,
    dataVersion: 1,
  },
};

function _getSettings() {
  return storage.get(STORAGE_KEYS.SETTINGS) || { ...DEFAULT_SETTINGS };
}

function _saveSettings(settings) {
  storage.set(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * 获取所有用户设置
 * @async
 * @returns {Promise<Object>} 完整的用户设置对象（通知、显示、数据配置）
 */
async function getSettings() {
  await _delay(50);
  return _getSettings();
}

/**
 * 更新单个通知设置项
 * @param {string} key - 通知设置键名（如 'careReminder', 'vaccineReminder'）
 * @param {boolean} value - 开关状态
 * @returns {Promise<Object>} 更新后的完整设置对象
 */
async function updateNotification(key, value) {
  await _delay(50);
  const settings = _getSettings();
  if (settings.notifications.hasOwnProperty(key)) {
    settings.notifications[key] = value;
    _saveSettings(settings);
  }
  return settings;
}

/**
 * 更新单个显示设置项
 * @param {string} key - 显示设置键名（如 'theme', 'language', 'compactMode'）
 * @param {*} value - 新值
 * @returns {Promise<Object>} 更新后的完整设置对象
 */
async function updateDisplay(key, value) {
  await _delay(50);
  const settings = _getSettings();
  if (settings.display.hasOwnProperty(key)) {
    settings.display[key] = value;
    _saveSettings(settings);
  }
  return settings;
}

/**
 * 获取通知偏好设置
 * @async
 * @returns {Promise<Object>} 通知设置对象（careReminder, vaccineReminder 等布尔值）
 */
async function getNotificationSettings() {
  await _delay(30);
  return _getSettings().notifications;
}

/**
 * 获取显示偏好设置
 * @async
 * @returns {Promise<Object>} 显示设置对象（theme, language 等）
 */
async function getDisplaySettings() {
  await _delay(30);
  return _getSettings().display;
}

/**
 * 重置所有设置为默认值
 * @async
 * @returns {Promise<Object>} 默认设置对象
 */
async function resetSettings() {
  await _delay(100);
  _saveSettings({ ...DEFAULT_SETTINGS });
  return DEFAULT_SETTINGS;
}

/**
 * 导出全部应用数据（mock 模式）
 * 包含宠物、照护、健康、训练、库存、开销、喂食、饮水、日记、相册和设置数据
 * @async
 * @returns {Promise<Object>} 包含所有数据模块的完整导出对象
 */
async function exportData() {
  await _delay(300);
  const data = {
    version: '2.9.0',
    exportDate: new Date().toISOString(),
    pets: storage.get(STORAGE_KEYS.PET_LIST) || [],
    careRecords: storage.get(STORAGE_KEYS.CARE_RECORDS) || [],
    healthRecords: storage.get(STORAGE_KEYS.HEALTH_RECORDS) || [],
    trainingRecords: storage.get(STORAGE_KEYS.TRAINING_RECORDS) || [],
    inventoryList: storage.get(STORAGE_KEYS.INVENTORY_LIST) || [],
    expenseRecords: storage.get(STORAGE_KEYS.EXPENSE_RECORDS) || [],
    feedingRecords: storage.get(STORAGE_KEYS.FEEDING_RECORDS) || [],
    waterRecords: storage.get(STORAGE_KEYS.WATER_RECORDS) || [],
    diaries: storage.get('diaries') || [],
    album: storage.get('album') || [],
    settings: _getSettings(),
  };
  return data;
}

/**
 * 获取数据统计摘要
 * @async
 * @returns {Promise<Object>} 各模块的记录数统计和总记录数
 */
async function getDataStats() {
  await _delay(50);
  const data = await exportData();
  return {
    pets: data.pets.length,
    careRecords: data.careRecords.length,
    healthRecords: data.healthRecords.length,
    trainingRecords: data.trainingRecords.length,
    inventoryItems: data.inventoryList.length,
    expenseRecords: data.expenseRecords.length,
    feedingRecords: data.feedingRecords.length,
    waterRecords: data.waterRecords.length,
    diaries: data.diaries.length,
    photos: data.album.length,
    totalRecords: data.careRecords.length + data.healthRecords.length + data.trainingRecords.length + data.expenseRecords.length + data.feedingRecords.length + data.waterRecords.length,
  };
}

module.exports = {
  getSettings, updateNotification, updateDisplay,
  getNotificationSettings, getDisplaySettings,
  resetSettings, exportData, getDataStats,
};

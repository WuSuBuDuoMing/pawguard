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

/** 获取所有设置 */
async function getSettings() {
  await _delay(50);
  return _getSettings();
}

/** 更新通知设置 */
async function updateNotification(key, value) {
  await _delay(50);
  const settings = _getSettings();
  if (settings.notifications.hasOwnProperty(key)) {
    settings.notifications[key] = value;
    _saveSettings(settings);
  }
  return settings;
}

/** 更新显示设置 */
async function updateDisplay(key, value) {
  await _delay(50);
  const settings = _getSettings();
  if (settings.display.hasOwnProperty(key)) {
    settings.display[key] = value;
    _saveSettings(settings);
  }
  return settings;
}

/** 获取通知设置 */
async function getNotificationSettings() {
  await _delay(30);
  return _getSettings().notifications;
}

/** 获取显示设置 */
async function getDisplaySettings() {
  await _delay(30);
  return _getSettings().display;
}

/** 重置所有设置 */
async function resetSettings() {
  await _delay(100);
  _saveSettings({ ...DEFAULT_SETTINGS });
  return DEFAULT_SETTINGS;
}

/** 导出所有数据 (mock) */
async function exportData() {
  await _delay(300);
  const data = {
    version: '2.1.0',
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

/** 获取数据统计 */
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

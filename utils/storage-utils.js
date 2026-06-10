/**
 * storage-utils.js - 本地缓存封装
 * 对 wx.setStorageSync / wx.getStorageSync 进行二次封装
 * 提供带过期时间的缓存、集合操作等便捷方法
 * @module storage-utils
 */

const { CACHE_EXPIRY } = require('./constants');

/**
 * 获取缓存值，支持过期时间检查
 * @param {string} key - 缓存键
 * @param {*} [defaultValue=null] - 默认值
 * @returns {*} 缓存值，过期或不存在返回 defaultValue
 */
function get(key, defaultValue = null) {
  try {
    const raw = wx.getStorageSync(key);
    if (!raw) return defaultValue;

    // 如果存储的是带过期时间的对象结构
    if (raw && typeof raw === 'object' && raw.hasOwnProperty('__expiry__')) {
      if (Date.now() > raw.__expiry__) {
        wx.removeStorageSync(key);
        return defaultValue;
      }
      return raw.value;
    }

    return raw;
  } catch (e) {
    console.error('[Storage] get error:', key, e);
    return defaultValue;
  }
}

/**
 * 设置缓存值，支持可选过期时间
 * @param {string} key - 缓存键
 * @param {*} value - 缓存值
 * @param {number} [expiry] - 过期时间(ms)，不传则永不过期
 */
function set(key, value, expiry) {
  try {
    if (expiry && expiry > 0) {
      wx.setStorageSync(key, {
        value,
        __expiry__: Date.now() + expiry,
        __created__: Date.now(),
      });
    } else {
      wx.setStorageSync(key, value);
    }
  } catch (e) {
    console.error('[Storage] set error:', key, e);
  }
}

/**
 * 移除指定缓存
 * @param {string} key - 缓存键
 */
function remove(key) {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('[Storage] remove error:', key, e);
  }
}

/**
 * 清空所有缓存
 */
function clear() {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('[Storage] clear error:', e);
  }
}

/**
 * 获取集合（数组），用于管理列表数据
 * @param {string} key - 缓存键
 * @returns {Array} 数组，不存在返回空数组
 */
function getCollection(key) {
  const data = get(key);
  return Array.isArray(data) ? data : [];
}

/**
 * 向集合中添加一项（自动添加 id 和时间戳）
 * @param {string} key - 缓存键
 * @param {Object} item - 要添加的对象
 * @returns {Object} 添加后的对象（含 id 和 timestamp）
 */
function addToCollection(key, item) {
  const list = getCollection(key);
  const newItem = {
    ...item,
    id: item.id || `item_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.push(newItem);
  set(key, list);
  return newItem;
}

/**
 * 更新集合中的指定项（按 id 查找并合并）
 * @param {string} key - 缓存键
 * @param {string} id - 项目 id
 * @param {Object} updates - 要更新的字段
 * @returns {Object|null} 更新后的对象，未找到返回 null
 */
function updateInCollection(key, id, updates) {
  const list = getCollection(key);
  const index = list.findIndex(item => item.id === id);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  set(key, list);
  return list[index];
}

/**
 * 从集合中移除指定项
 * @param {string} key - 缓存键
 * @param {string} id - 项目 id
 * @returns {boolean} 是否成功移除
 */
function removeFromCollection(key, id) {
  const list = getCollection(key);
  const newList = list.filter(item => item.id !== id);
  if (newList.length === list.length) return false;
  set(key, newList);
  return true;
}

/**
 * 从集合中查找单个项目
 * @param {string} key - 缓存键
 * @param {string} id - 项目 id
 * @returns {Object|null} 找到的对象，未找到返回 null
 */
function getFromCollection(key, id) {
  const list = getCollection(key);
  return list.find(item => item.id === id) || null;
}

module.exports = {
  get,
  set,
  remove,
  clear,
  getCollection,
  addToCollection,
  updateInCollection,
  removeFromCollection,
  getFromCollection,
};

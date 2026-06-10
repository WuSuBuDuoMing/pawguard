/**
 * mock-utils.js - Mock 数据辅助工具
 * 提供 ID 生成、随机数据生成、异步模拟等常用方法
 * @module mock-utils
 */

/**
 * 生成带前缀的唯一 ID
 * @param {string} [prefix='item'] - ID 前缀
 * @returns {string} 如 "pet_m2x5k9a7"
 */
function generateId(prefix = 'item') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * 从数组中随机选取一项
 * @param {Array} arr - 源数组
 * @returns {*} 随机选取的元素
 */
function randomFromArray(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 生成指定范围内的随机整数 [min, max]
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机浮点数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} [decimals=2] - 小数位数
 * @returns {number}
 */
function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * 生成指定范围内的随机日期
 * @param {Date|string} start - 起始日期
 * @param {Date|string} end - 结束日期
 * @returns {string} YYYY-MM-DD 格式
 */
function randomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  const d = new Date(randomTime);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 生成随机布尔值
 * @param {number} [probability=0.5] - 为 true 的概率 (0~1)
 * @returns {boolean}
 */
function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * 模拟异步延迟
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise}
 */
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 打乱数组顺序（Fisher-Yates）
 * @param {Array} arr - 源数组（会被修改）
 * @returns {Array} 打乱后的数组
 */
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

module.exports = {
  generateId,
  randomFromArray,
  randomInt,
  randomFloat,
  randomDate,
  randomBool,
  delay,
  shuffleArray,
};

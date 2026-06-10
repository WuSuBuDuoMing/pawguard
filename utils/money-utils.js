/**
 * money-utils.js - 财务管理工具函数
 * 提供金额格式化、月度/年度统计、异常检测等功能
 * @module money-utils
 */

const { parseDate, formatDate } = require('./date-utils');

/**
 * 格式化金额为带千分符的人民币格式
 * @param {number} amount - 金额数值
 * @returns {string} 如 "¥1,234.56"
 *
 * @example
 * formatMoney(1234.5)   // '¥1,234.50'
 * formatMoney(0)        // '¥0.00'
 * formatMoney(-99.9)    // '-¥99.90'
 */
function formatMoney(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '¥0.00';
  const isNegative = amount < 0;
  const abs = Math.abs(amount).toFixed(2);
  // 添加千分位分隔符
  const parts = abs.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${isNegative ? '-' : ''}¥${parts.join('.')}`;
}

/**
 * 格式化金额为中文简单格式
 * @param {number} amount - 金额数值
 * @returns {string} 如 "1234.56元"
 */
function formatMoneyCN(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00元';
  return `${amount.toFixed(2)}元`;
}

/**
 * 按年月筛选记录并计算总金额
 * @param {Array} records - 消费记录数组，每条需包含 amount(数值)、date(日期字符串) 字段
 * @param {number} year - 年份，如 2026
 * @param {number} month - 月份（1-12）
 * @returns {number} 指定月份的消费总金额
 */
function getMonthlyTotal(records, year, month) {
  if (!Array.isArray(records) || records.length === 0) return 0;

  return records
    .filter((r) => {
      const d = parseDate(r.date);
      if (!d) return false;
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

/**
 * 按分类统计月度消费占比
 * 返回各分类的金额及百分比，按金额降序排列
 * @param {Array} records - 消费记录数组，每条需包含 amount、date、category 字段
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {Array<{category: string, amount: number, percentage: number}>}
 *
 * @example
 * getCategoryBreakdown(records, 2026, 6)
 * // => [{ category: '食物', amount: 500, percentage: 50 }, ...]
 */
function getCategoryBreakdown(records, year, month) {
  if (!Array.isArray(records) || records.length === 0) return [];

  // 筛选指定月份的记录
  const filtered = records.filter((r) => {
    const d = parseDate(r.date);
    if (!d) return false;
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  if (filtered.length === 0) return [];

  // 按分类聚合
  const categoryMap = {};
  for (const record of filtered) {
    const category = record.category || '其他';
    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }
    categoryMap[category] += Number(record.amount) || 0;
  }

  // 计算总金额
  const total = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  // 转为数组并计算百分比
  const result = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount: parseFloat(amount.toFixed(2)),
    percentage: parseFloat(((amount / total) * 100).toFixed(1)),
  }));

  // 按金额降序排列
  result.sort((a, b) => b.amount - a.amount);
  return result;
}

/**
 * 计算指定年份的消费总额
 * @param {Array} records - 消费记录数组
 * @param {number} year - 年份
 * @returns {number} 年度总消费金额
 */
function getYearlyTotal(records, year) {
  if (!Array.isArray(records) || records.length === 0) return 0;

  return records
    .filter((r) => {
      const d = parseDate(r.date);
      return d && d.getFullYear() === year;
    })
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

/**
 * 计算指定月份的日均消费
 * @param {Array} records - 消费记录数组
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {number} 日均消费金额，保留两位小数
 */
function getDailyAverage(records, year, month) {
  const total = getMonthlyTotal(records, year, month);
  // 获取该月天数
  const daysInMonth = new Date(year, month, 0).getDate();
  if (daysInMonth === 0) return 0;
  return parseFloat((total / daysInMonth).toFixed(2));
}

/**
 * 找出金额最高的单笔消费记录
 * @param {Array} records - 消费记录数组
 * @returns {Object|null} 最高金额的记录对象，无记录返回 null
 */
function getHighestExpense(records) {
  if (!Array.isArray(records) || records.length === 0) return null;

  return records.reduce((max, r) => {
    const amount = Number(r.amount) || 0;
    const maxAmount = Number(max.amount) || 0;
    return amount > maxAmount ? r : max;
  }, records[0]);
}

/**
 * 查找超出阈值的异常高额消费
 * @param {Array} records - 消费记录数组
 * @param {number} [threshold=500] - 阈值金额
 * @returns {Array} 超出阈值的消费记录数组
 */
function getAbnormalExpense(records, threshold = 500) {
  if (!Array.isArray(records) || records.length === 0) return [];
  return records.filter((r) => (Number(r.amount) || 0) > threshold);
}

/**
 * 预估全年消费总额
 * 根据已有的年度数据推算，使用已消费月份的日均消费进行外推
 * @param {Array} records - 消费记录数组
 * @param {number} year - 年份
 * @returns {{total: number, average: number, days: number, projection: number}}
 *   total-已消费总额, average-日均消费, days-已记录天数, projection-全年预估
 */
function estimateYearlyCost(records, year) {
  if (!Array.isArray(records) || records.length === 0) {
    return { total: 0, average: 0, days: 0, projection: 0 };
  }

  // 筛选当年记录
  const yearRecords = records.filter((r) => {
    const d = parseDate(r.date);
    return d && d.getFullYear() === year;
  });

  if (yearRecords.length === 0) {
    return { total: 0, average: 0, days: 0, projection: 0 };
  }

  const total = yearRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // 计算从年初到当前日期（或年末）的天数
  const now = new Date();
  const currentYear = now.getFullYear();
  let totalDays;
  if (year === currentYear) {
    // 当年：计算到当前的天数
    const startOfYear = new Date(year, 0, 1);
    const diffDays = Math.ceil((now - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    totalDays = diffDays;
  } else if (year < currentYear) {
    // 往年：365天（或闰年366天）
    totalDays = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;
  } else {
    // 未来年份，不进行预估
    return { total, average: 0, days: yearRecords.length, projection: total };
  }

  const average = totalDays > 0 ? parseFloat((total / totalDays).toFixed(2)) : 0;
  // 全年按365天预估
  const projection = parseFloat((average * 365).toFixed(2));

  return {
    total: parseFloat(total.toFixed(2)),
    average,
    days: totalDays,
    projection,
  };
}

module.exports = {
  formatMoney,
  formatMoneyCN,
  getMonthlyTotal,
  getCategoryBreakdown,
  getYearlyTotal,
  getDailyAverage,
  getHighestExpense,
  getAbnormalExpense,
  estimateYearlyCost,
};

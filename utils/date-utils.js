/**
 * date-utils.js - 日期与时间工具函数
 * 提供日期格式化、比较、范围计算等常用操作
 * 所有函数均兼容字符串和 Date 对象输入
 * @module date-utils
 */

/**
 * 将输入安全地解析为 Date 对象
 * @param {string|Date} str - 日期字符串或 Date 对象
 * @returns {Date|null} 解析成功返回 Date 对象，失败返回 null
 */
function parseDate(str) {
  if (!str) return null;
  if (str instanceof Date) {
    return isNaN(str.getTime()) ? null : str;
  }
  // 兼容 "YYYY-MM-DD"、"YYYY-MM-DD HH:mm:ss"、"YYYY/MM/DD" 等常见格式
  const normalized = String(str).replace(/\//g, '-');
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * 格式化日期为指定格式字符串
 * @param {string|Date} date - 要格式化的日期
 * @param {string} [format='YYYY-MM-DD'] - 格式模板，支持 YYYY/MM/DD/HH/mm/ss
 * @returns {string} 格式化后的日期字符串，解析失败返回空字符串
 *
 * @example
 * formatDate('2026-06-08', 'YYYY-MM-DD') // '2026-06-08'
 * formatDate('2026-06-08', 'YYYY/MM/DD') // '2026/06/08'
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const d = parseDate(date);
  if (!d) return '';

  const tokens = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ss: String(d.getSeconds()).padStart(2, '0'),
  };

  let result = format;
  // 按长度降序替换，避免 MM 被误替换为 M 再匹配不到
  const keys = Object.keys(tokens).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    result = result.replace(key, tokens[key]);
  }
  return result;
}

/**
 * 格式化为完整日期时间字符串
 * @param {string|Date} date - 日期
 * @returns {string} 格式为 "YYYY-MM-DD HH:mm:ss"
 */
function formatDateTime(date) {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化为中文日期格式
 * @param {string|Date} date - 日期
 * @returns {string} 例如 "2026年6月8日"
 */
function formatDateCN(date) {
  const d = parseDate(date);
  if (!d) return '';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 获取星期几的中文表示
 * @param {string|Date} date - 日期
 * @returns {string} "星期一" ~ "星期日"
 */
function getDayOfWeek(date) {
  const d = parseDate(date);
  if (!d) return '';
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return days[d.getDay()];
}

/**
 * 计算距今天数差
 * 正数表示未来，负数表示过去，0 表示今天
 * @param {string|Date} dateStr - 目标日期
 * @returns {number} 天数差，解析失败返回 0
 */
function getDaysUntil(dateStr) {
  const target = parseDate(dateStr);
  if (!target) return 0;

  const now = new Date();
  // 只比较日期部分，忽略时间
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = targetStart.getTime() - todayStart.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * 获取相对时间描述
 * 根据距当前时间的远近，返回友好的中文表述
 * @param {string|Date} dateStr - 日期
 * @returns {string} 如 "刚刚"、"5分钟前"、"昨天"、"2026-05-01"
 */
function getRelativeTime(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays === 2) {
    return '前天';
  } else if (diffDays < 30) {
    return `${diffDays}天前`;
  } else {
    return formatDate(d, 'YYYY-MM-DD');
  }
}

/**
 * 判断是否为今天
 * @param {string|Date} dateStr - 日期
 * @returns {boolean}
 */
function isToday(dateStr) {
  return getDaysUntil(dateStr) === 0;
}

/**
 * 判断是否在本周内
 * @param {string|Date} dateStr - 日期
 * @returns {boolean}
 */
function isThisWeek(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;

  const now = new Date();
  const startOfWeek = new Date(now);
  // getDay(): 0=周日，1=周一 ... 6=周六，计算本周一的日期
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return d >= startOfWeek && d <= endOfWeek;
}

/**
 * 判断是否在本月内
 * @param {string|Date} dateStr - 日期
 * @returns {boolean}
 */
function isThisMonth(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;

  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/**
 * 计算年龄展示字符串
 * 根据生日精确到岁、月、天
 * @param {string|Date} birthday - 生日日期
 * @returns {string} 如 "2岁3个月"、"5个月"、"12天"
 */
function getAgeDisplay(birthday) {
  const bd = parseDate(birthday);
  if (!bd) return '未知';

  const now = new Date();
  let years = now.getFullYear() - bd.getFullYear();
  let months = now.getMonth() - bd.getMonth();
  let days = now.getDate() - bd.getDate();

  // 如果当前日期还没到本月生日日期，月份减一
  if (days < 0) {
    months--;
    // 获取上个月的天数来计算剩余天数
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    if (months > 0) {
      return `${years}岁${months}个月`;
    }
    return `${years}岁`;
  }
  if (months > 0) {
    return `${months}个月`;
  }
  return `${days}天`;
}

/**
 * 计算下次护理提醒日期
 * 根据上次护理日期和频率间隔，推算出下次应执行的日期
 * @param {string|Date} lastDate - 上次护理日期
 * @param {string} frequency - 频率类型: 'daily'(每天), 'weekly'(每周), 'monthly'(每月)
 * @returns {Date|null} 下次提醒日期
 */
function getNextReminderDate(lastDate, frequency) {
  const d = parseDate(lastDate);
  if (!d) return null;

  const next = new Date(d);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }
  return next;
}

/**
 * 获取当前周的日期范围
 * @returns {{start: string, end: string}} 本周一和本周日的日期字符串
 */
function getWeekRange() {
  const now = new Date();
  // 计算本周一
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);

  // 计算本周日
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

/**
 * 获取当前月的日期范围
 * @returns {{start: string, end: string}} 本月1日和月末的日期字符串
 */
function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  // 下个月第0天即为本月最后一天
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

/**
 * 获取最近 n 天的日期字符串数组
 * 按时间正序排列（从远到近）
 * @param {number} n - 天数
 * @returns {string[]} 最近 n 天的日期字符串数组
 */
function getRecentDays(n) {
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
}

module.exports = {
  formatDate,
  formatDateTime,
  formatDateCN,
  getDayOfWeek,
  getDaysUntil,
  getRelativeTime,
  isToday,
  isThisWeek,
  isThisMonth,
  getAgeDisplay,
  getNextReminderDate,
  getWeekRange,
  getMonthRange,
  getRecentDays,
  parseDate,
};
